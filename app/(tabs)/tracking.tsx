import { View, StyleSheet, ScrollView, AppState, AppStateStatus, Dimensions, Linking } from 'react-native'
import { Text, Button, useTheme,  IconButton, Portal, Dialog } from 'react-native-paper'
import { BarChart } from "react-native-gifted-charts"
import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSession } from '@/contexts/auth'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/services/api'
import { getTrackingItem, syncWithServer, syncSteppersWithServer } from '@/services/cache/tracking'
import { getCachedFormStatus, syncFormStatusWithServer } from '@/services/cache/forms'
import Task from '@/components/Task'
import SensorStepper, { DayStep } from '@/components/SensorStepper'
import FormStepper from '@/components/FormStepper'

function formatDuration(totalMilliseconds: number | null | undefined): string {
  if (totalMilliseconds == null || Number.isNaN(totalMilliseconds) || totalMilliseconds <= 0) return '0s'

  const totalSeconds = Math.floor(totalMilliseconds / 1000)
  const d = Math.floor(totalSeconds / (3600 * 24))
  const h = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  const parts: string[] = []

  if (d > 0) {
    parts.push(`${d}j`, `${h}h`, `${m}m`, `${s}s`)
  } else if (h > 0) {
    parts.push(`${h}h`, `${m}m`, `${s}s`)
  } else if (m > 0) {
    parts.push(`${m}m`, `${s}s`)
  } else {
    parts.push(`${s}s`)
  }

  return parts.join(' ')
}

export default function TrackingScreen() {
  const theme = useTheme()
  const { accessToken } = useSession()
  const { width: screenWidth } = Dimensions.get('window')

  let isAdmin = false
  if (accessToken) {
    try {
      const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
      isAdmin = payload['team'] === 0
    } catch {}
  }

  // States pour le suivi
  const [barData, setBarData] = useState<any[]>([])
  const [openingAmount, setOpeningAmount] = useState<number>(0)
  const [exposureDuration, setExposureDuration] = useState<number>(0)
  const [infoModalVisible, setInfoModalVisible] = useState<boolean>(false)

  // State pour les questionnaires
  const [displayForm, setDisplayForm] = useState<boolean>(false)

  // States pour les steppers
  const defaultSensorDays: DayStep[] = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((label, idx) => ({
    label,
    status: 'empty',
    isTogglable: false
  }))

  const defaultFormDays: DayStep[] = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'].map((label, idx) => ({
    label,
    status: 'empty',
    isTogglable: false
  }))

  const [sensorDays, setSensorDays] = useState<DayStep[]>(defaultSensorDays)
  const [formDays, setFormDays] = useState<DayStep[]>(defaultFormDays)

  // Chargement des steppers
  const getSensorSteppersData = async () => {
    try {
      const data = await syncSteppersWithServer('sensors')

      if (data?.days) setSensorDays(data.days)
    } catch (e) {
      console.error("Failed to sync sensor steppers with server:", e)
    }
  }

  const getFormSteppersData = async () => {
    try {
      const data = await syncSteppersWithServer('forms')

      if (data?.days) setFormDays(data.days)
    } catch (e) {
      console.error("Failed to sync form steppers with server:", e)
    }
  }

  const handleToggleSensorDay = async (stepDayIndex: number) => {
    try {
      await api.post('/sensors/toggle', { weekDayIndex: stepDayIndex })
      await getSensorSteppersData()
    } catch (e) {
      console.error("Error :", stepDayIndex, e)
    }
  }

  // Chargement des données de suivi
  const getTracking = async () => {
    const currentJsDay = new Date().getDay()
    const currentDayIndex = currentJsDay === 0 ? 6 : currentJsDay - 1

    const getCurrentWeekMonday = () => {
      const d = new Date()
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(d.setDate(diff))
      monday.setHours(0, 0, 0, 0)
      return monday.toISOString().split('T')[0]
    }

    const sanitizeOpeningData = (openingList: any[]) => {
      if (!Array.isArray(openingList)) return []
      return openingList.map((item: any, index: number) => ({
        ...item,
        // Future days in the current week cannot have openings yet
        value: index > currentDayIndex ? 0 : (item.value || 0),
        frontColor: index === currentDayIndex ? theme.colors.primary : 'lightgray'
      }))
    }

    try {
      const cachedWeek = await getTrackingItem('weekStart')
      const currentWeek = getCurrentWeekMonday()

      const cachedAmount = await getTrackingItem('amount')
      const cachedDuration = await getTrackingItem('duration')
      const cachedOpening = await getTrackingItem('opening')

      if (cachedAmount !== undefined) setOpeningAmount(cachedAmount)
      if (cachedDuration !== undefined) setExposureDuration(cachedDuration)

      if (cachedOpening && cachedWeek === currentWeek) {
        setBarData(sanitizeOpeningData(cachedOpening))
      } else {
        const emptyLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
        setBarData(sanitizeOpeningData(emptyLabels.map(label => ({ label, value: 0 }))))
      }
    } catch (e) {
      console.error("Failed to load tracking from cache:", e)
    }

    try {
      const data = await syncWithServer()
      if (data) {
        setOpeningAmount(data.amount)
        setExposureDuration(data.duration)
        if (data.opening) {
          setBarData(sanitizeOpeningData(data.opening))
        }
      }
    } catch (e) {
      console.error("Failed to sync tracking with server:", e)
    }
  }

  // Chargement des questionnaires et télémétrie
  const getFormAndTelemetry = async () => {
    try {
      const cachedDisplay = await getCachedFormStatus()
      if (cachedDisplay !== undefined && cachedDisplay !== null) {
        setDisplayForm(cachedDisplay)
      }
    } catch (e) {
      console.error("Failed to load form status from cache:", e)
    }

    try {
      const data = await syncFormStatusWithServer()
      if (data && typeof data.display === 'boolean') {
        setDisplayForm(data.display)
      }
    } catch (error) {
      console.error("Failed to sync form status with server:", error)
    }

    Notifications.getDevicePushTokenAsync().then(e => {
      api.put('/notifications/token', { fcmToken: e.data })
    })

    Notifications.setNotificationChannelAsync('sensor', {
      name: 'Rappels de port de capteur',
      description: 'Canal SENSOR',
      importance: Notifications.AndroidImportance.MAX
    })

    Notifications.setNotificationChannelAsync('form', {
      name: 'Rappels de questionnaire',
      description: 'Canal FORM',
      importance: Notifications.AndroidImportance.MAX
    })

    const registerDevice = async () => {
      const androidId = await AsyncStorage.getItem('androidId')
      if (!androidId) console.log('androidId manquant')
      await api.put('/telemetry/device', { androidId, device: Device })
    }

    registerDevice()
  }

  useFocusEffect(
    useCallback(() => {
      getTracking()
      getFormAndTelemetry()
      getSensorSteppersData()
      getFormSteppersData()

      const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          getTracking()
          getFormAndTelemetry()
          getSensorSteppersData()
          getFormSteppersData()
          
          const timer = setTimeout(() => {
            getTracking()
            getFormAndTelemetry()
            getSensorSteppersData()
            getFormSteppersData()
          }, 800)

          return () => clearTimeout(timer)
        }
      })

      return () => {
        subscription.remove()
      }
    }, [])
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.headerContainer}>
        <View style={styles.headerSide} />
        <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>Mon suivi</Text>
        <View style={styles.headerSide}>
          <IconButton
            icon="information-outline"
            size={24}
            iconColor={theme.colors.primary}
            onPress={() => setInfoModalVisible(true)}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Section 1 : Questionnaires */}
        {displayForm && (
          <>
            <Text variant="titleLarge" style={[styles.sectionHeader, { color: theme.colors.primary }]}>
              Vos questionnaires à compléter
            </Text>

            <Task
              item={{
                id: "1",
                uid: "t1",
                title: "Questionnaire quotidien",
                content: "Vous avez un questionnaire à remplir !",
                image: "https://activmotiv.fr/static/notifications/ema.png?key=b4b01d6c7472362a30ac5470aac7f6be",
                action: { path: "/(forms)/", text: "Remplir" }
              }}
              disabled={false}
            />
          </>
        )}

        {/* Section 2 : Progression cette semaine */}
        <Text variant="titleLarge" style={[styles.sectionHeader, { color: theme.colors.primary, marginTop: 24 }]}>
          Progression cette semaine
        </Text>

        {isAdmin ? (
          <FormStepper
            title="Questionnaire quotidien"
            days={formDays}
            icon="clipboard-check-outline"
          />
        ) : (
          <View style={styles.card}>
            <FormStepper
              title="Questionnaire quotidien"
              days={formDays}
              icon="clipboard-check-outline"
            />
          </View>
        )}

        <SensorStepper
          title="Port du capteur"
          days={sensorDays}
          icon="walk"
          onDayPress={handleToggleSensorDay}
        />

        {/* Section 3 : Statistiques d'utilisation */}
        <Text variant="titleLarge" style={[styles.sectionHeader, { color: theme.colors.primary, marginTop: 24 }]}>
          Statistiques d'utilisation
        </Text>

        <View style={styles.statsContainer}>
          <View style={[styles.stat, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant='bodyMedium' style={{ color: theme.colors.onPrimaryContainer, fontWeight: '500' }}>Expositions</Text>
            <Text variant='titleLarge' style={[styles.stat_value, { color: theme.colors.onPrimaryContainer }]}>{openingAmount}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant='bodyMedium' style={{ color: theme.colors.onPrimaryContainer, fontWeight: '500' }}>Temps d'exposition</Text>
            <Text variant='titleLarge' style={[styles.stat_value, { color: theme.colors.onPrimaryContainer }]}>
              {formatDuration(exposureDuration)}
            </Text>
          </View>
        </View>

        <View style={styles.chartWrapper}>
          {(() => {
            const chartWidth = screenWidth - 100
            const calculatedSpacing = Math.max(15, (chartWidth - (7 * 22) - 40) / 6)
            const maxVal = Math.max(...barData.map((item: any) => Number(item?.value) || 0), 0)
            const roundedMax = Math.ceil(maxVal / 10) * 10
            const maxValue = Math.max(10, roundedMax)
            const stepValue = maxValue / 10

            const formattedBarData = barData.map((item: any, index: number) => {
              let shift = 0
              if (index === 0) {
                shift = -20
              }
              return {
                ...item,
                leftShiftForTooltip: item.leftShiftForTooltip ?? shift,
              }
            })

            const chartProps: any = {
              disablePress: false,
              width: chartWidth,
              spacing: calculatedSpacing,
              initialSpacing: 25,
              barWidth: 22,
              barBorderRadius: 4,
              data: formattedBarData,
              maxValue: maxValue,
              noOfSections: 10,
              stepValue: stepValue,
              yAxisThickness: 0,
              xAxisThickness: 0,
              xAxisLabelTextStyle: { color: theme.colors.onSurface, fontSize: 11 },
              yAxisTextStyle: { color: theme.colors.onSurface },
              xAxisColor: theme.colors.outlineVariant,
              yAxisColor: theme.colors.outlineVariant,
              autoCenterTooltip: true,
              overflowTop: 40,
              leftShiftForLastIndexTooltip: 28,
              renderTooltip: (item: any) => (
                <View style={[styles.tooltip, { backgroundColor: theme.colors.primary }]}>
                  <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold', fontSize: 11 }}>
                    {item.value} {item.value > 1 ? 'ouvertures' : 'ouverture'}
                  </Text>
                </View>
              ),
            }
            return <BarChart {...(chartProps as any)} />
          })()}
        </View>

        <Text variant='bodySmall' style={[styles.chartLegend, { color: theme.colors.onSurfaceVariant }]}>
          Nombre d'expositions journalières
        </Text>

      </ScrollView>

      <Portal>
        <Dialog visible={infoModalVisible} onDismiss={() => setInfoModalVisible(false)}>
          <Dialog.Title style={{ textAlign: 'center' }}>Informations</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 24, maxHeight: 400 }}>
            <ScrollView contentContainerStyle={{ paddingVertical: 8, gap: 12 }}>
              <Text variant="bodyMedium">
                Cette page vous permet de suivre vos activités quotidiennes et vos statistiques d'exposition :
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Questionnaires à compléter</Text> : Accédez directement aux questionnaires journaliers lorsqu'ils sont disponibles.
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Progression cette semaine</Text> : Visualisez vos questionnaires complétés et le port du capteur jour par jour. Vous pouvez appuyer sur un jour du capteur pour mettre à jour votre suivi (en cas d'oubli vous serez contacté par le chercheur).
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Statistiques d'utilisation</Text> : Consultez le nombre total d'expositions et la durée d'exposition cumulée.
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Graphique</Text> : Visualisez l'évolution quotidienne de vos expositions au fil de la semaine.
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Notice d'utilisation du capteur</Text> :{' '}
                <Text
                  style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}
                  onPress={() => Linking.openURL('https://activmotiv.fr/static/documents/Notice_ActiGraph.pdf?key=b4b01d6c7472362a30ac5470aac7f6be')}
                >
                  Consulter la notice ActiGraph
                </Text>
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setInfoModalVisible(false)}>Compris</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerSide: {
    width: 48,
    alignItems: 'center',
  },
  title: { flex: 1, textAlign: 'center', paddingVertical: 12, fontWeight: "bold" },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 18
  },
  card: {
    marginBottom: 10,
    borderRadius: 8
  },
  nextFormCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  nextFormIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  stat: {
    borderRadius: 12,
    padding: 14,
    flex: 1,
    marginHorizontal: 4
  },
  stat_value: {
    marginTop: 4,
    fontWeight: 'bold'
  },
  chartWrapper: {
    marginTop: 18,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible'
  },
  chartLegend: {
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500'
  },
  tooltip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  }
})
