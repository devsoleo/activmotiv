import { View, StyleSheet, ScrollView, AppState, AppStateStatus, Dimensions } from 'react-native'
import { Text, Card, Button, useTheme, Icon, IconButton, Portal, Dialog } from 'react-native-paper'
import { BarChart } from "react-native-gifted-charts"
import { useCallback, useState } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Buffer } from 'buffer'
import { useSession } from '@/contexts/auth'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/services/api'
import { getTrackingItem, syncWithServer, getCachedSteppers, syncSteppersWithServer } from '@/services/cache/tracking'
import { getCachedQuestionnaireStatus, syncQuestionnaireStatusWithServer } from '@/services/cache/questionnaires'
import Task from '@/components/Task'
import WeeklyStepper, { DayStep, DayStatus } from '@/components/WeeklyStepper'

function formatDuration(totalMilliseconds: number | null | undefined): string {
  if (totalMilliseconds == null || isNaN(totalMilliseconds) || totalMilliseconds <= 0) return '0s'
  const totalSeconds = Math.floor(totalMilliseconds / 1000)
  const d = Math.floor(totalSeconds / (3600 * 24))
  const h = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  const parts: string[] = []

  if (d > 0) {
    parts.push(`${d}j`)
    parts.push(`${h}h`)
    parts.push(`${m}m`)
    parts.push(`${s}s`)
  } else if (h > 0) {
    parts.push(`${h}h`)
    parts.push(`${m}m`)
    parts.push(`${s}s`)
  } else if (m > 0) {
    parts.push(`${m}m`)
    parts.push(`${s}s`)
  } else {
    parts.push(`${s}s`)
  }

  return parts.join(' ')
}

function formatNextQuestionnaireDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null
    const formatted = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  } catch {
    return null
  }
}

export default function TrackingScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { accessToken } = useSession()
  const { width: screenWidth } = Dimensions.get('window')

  let isAdmin = false
  if (accessToken) {
    try {
      isAdmin = !!JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())['admin']
    } catch {}
  }
  
  // States pour le suivi
  const [barData, setBarData] = useState<any[]>([])
  const [openingAmount, setOpeningAmount] = useState<number>(0)
  const [exposureDuration, setExposureDuration] = useState<number>(0)
  const [infoModalVisible, setInfoModalVisible] = useState<boolean>(false)
  
  // State pour les questionnaires
  const [displayQuestionnaire, setDisplayQuestionnaire] = useState<boolean>(false)

  // States pour les steppers
  const currentJsDay = new Date().getDay()
  const currentDayIndex = currentJsDay === 0 ? 6 : currentJsDay - 1

  const defaultDays: DayStep[] = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((label, idx) => ({
    label,
    status: idx < currentDayIndex ? 'not-done' : 'empty',
    completed: false
  }))
  const [questionnairesDays, setQuestionnairesDays] = useState<DayStep[]>(defaultDays)
  const [questionnairesCount, setQuestionnairesCount] = useState<number>(0)
  const [sensorDays, setSensorDays] = useState<DayStep[]>(defaultDays)
  const [sensorCount, setSensorCount] = useState<number>(0)
  const [inActivePhase, setInActivePhase] = useState<boolean>(false)
  const [nextQuestionnaireDate, setNextQuestionnaireDate] = useState<string | null>(null)

  // Chargement des steppers
  const getSteppersData = async () => {
    try {
      const cached = await getCachedSteppers()
      if (cached) {
        if (cached.questionnaires) setQuestionnairesDays(cached.questionnaires)
        if (cached.sensor) setSensorDays(cached.sensor)
        if (cached.questionnairesCount !== undefined) setQuestionnairesCount(cached.questionnairesCount)
        if (cached.sensorCount !== undefined) setSensorCount(cached.sensorCount)
        if (typeof cached.inActivePhase === 'boolean') setInActivePhase(cached.inActivePhase)
        if (cached.nextQuestionnaireDate !== undefined) setNextQuestionnaireDate(cached.nextQuestionnaireDate)
      }
    } catch (e) {
      console.error("Failed to load steppers from cache:", e)
    }

    try {
      const data = await syncSteppersWithServer()
      if (data) {
        if (data.questionnaires) setQuestionnairesDays(data.questionnaires)
        if (data.sensor) setSensorDays(data.sensor)
        if (data.questionnairesCount !== undefined) setQuestionnairesCount(data.questionnairesCount)
        if (data.sensorCount !== undefined) setSensorCount(data.sensorCount)
        if (typeof data.inActivePhase === 'boolean') setInActivePhase(data.inActivePhase)
        if (data.nextQuestionnaireDate !== undefined) setNextQuestionnaireDate(data.nextQuestionnaireDate)
      }
    } catch (e) {
      console.error("Failed to sync steppers with server:", e)
    }
  }

  // Toggle du port du capteur pour un jour (passé ou présent, ou futur si admin)
  const handleToggleSensorDay = async (dayIndex: number) => {
    if (!isAdmin && dayIndex > currentDayIndex) return

    setSensorDays(prev => {
      const updated = [...prev]
      const target = updated[dayIndex]
      const isCurrentlyDone = target.status === 'done' || target.completed

      let newStatus: DayStatus = 'empty'
      if (!isCurrentlyDone) {
        newStatus = 'done'
      } else {
        newStatus = dayIndex < currentDayIndex ? 'not-done' : 'empty'
      }

      updated[dayIndex] = {
        ...target,
        status: newStatus,
        completed: newStatus === 'done'
      }
      return updated
    })

    setSensorCount(prev => {
      const target = sensorDays[dayIndex]
      const isCurrentlyDone = target.status === 'done' || target.completed
      return isCurrentlyDone ? Math.max(0, prev - 1) : prev + 1
    })

    try {
      await api.post('/sensor/toggle', { dayIndex })
      const data = await syncSteppersWithServer()
      if (data) {
        if (data.sensor) setSensorDays(data.sensor)
        if (data.sensorCount !== undefined) setSensorCount(data.sensorCount)
      }
    } catch (e) {
      console.error("Failed to toggle sensor for day:", dayIndex, e)
      getSteppersData()
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
  const getQuestionnairesAndTelemetry = async () => {
    try {
      const cachedDisplay = await getCachedQuestionnaireStatus()
      if (cachedDisplay !== undefined && cachedDisplay !== null) {
        setDisplayQuestionnaire(cachedDisplay)
      }
    } catch (e) {
      console.error("Failed to load questionnaire status from cache:", e)
    }

    try {
      const data = await syncQuestionnaireStatusWithServer()
      if (data && typeof data.display === 'boolean') {
        setDisplayQuestionnaire(data.display)
      }
    } catch (error) {
      console.error("Failed to sync questionnaire status with server:", error)
    }

    Notifications.getDevicePushTokenAsync().then(e => {
      api.put('/notifications/token', { fcmToken: e.data })
    })

    Notifications.setNotificationChannelAsync('sensor', {
      name: 'Rappels de port de capteur',
      description: 'Canal SENSOR',
      importance: Notifications.AndroidImportance.MAX
    })

    Notifications.setNotificationChannelAsync('questionnaire', {
      name: 'Rappels de questionnaire',
      description: 'Canal QUESTIONNAIRE',
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
      getQuestionnairesAndTelemetry()
      getSteppersData()

      const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          getTracking()
          getQuestionnairesAndTelemetry()
          getSteppersData()
          
          const timer = setTimeout(() => {
            getTracking()
            getQuestionnairesAndTelemetry()
            getSteppersData()
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
        {displayQuestionnaire && (
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
                action: { path: "/(questionnaires)/", text: "Remplir" }
              }}
              disabled={false}
            />
          </>
        )}

        {/* Section 2 : Progression cette semaine */}
        <Text variant="titleLarge" style={[styles.sectionHeader, { color: theme.colors.primary, marginTop: 24 }]}>
          Progression cette semaine
        </Text>

        {inActivePhase || isAdmin ? (
          <WeeklyStepper
            title="Questionnaire journalier"
            days={questionnairesDays}
            completedCount={questionnairesCount}
            icon="clipboard-check-outline"
            currentDayIndex={currentDayIndex}
            isAdmin={isAdmin}
          />
        ) : (
          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.nextQuestionnaireCardContent}>
              <View style={[styles.nextQuestionnaireIconWrapper, { backgroundColor: theme.colors.primaryContainer }]}>
                <Icon source="clipboard-clock-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                  Questionnaire journalier
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                  {(() => {
                    const formatted = nextQuestionnaireDate ? formatNextQuestionnaireDate(nextQuestionnaireDate) : null
                    const fallback = formatNextQuestionnaireDate(new Date(Date.now() + 86400000).toISOString())
                    return `Prochain questionnaire le ${formatted || fallback}`
                  })()}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        <WeeklyStepper
          title="Port du capteur"
          days={sensorDays}
          completedCount={sensorCount}
          icon="walk"
          currentDayIndex={currentDayIndex}
          isAdmin={isAdmin}
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
  nextQuestionnaireCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  nextQuestionnaireIconWrapper: {
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
