import { View, StyleSheet, ScrollView, AppState, AppStateStatus, Dimensions, Linking } from 'react-native'
import { Text, Button, useTheme,  IconButton, Portal, Dialog } from 'react-native-paper'
import { BarChart } from "react-native-gifted-charts"
import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/services/api'
import { useTrackingData, useFormStatus, useSensorSteppers, useFormSteppers } from '@/hooks/useTrackingQueries'
import { enqueueSensorToggle } from '@/services/queue/sensors'
import Task from '@/components/Task'
import SensorStepper, { DayStep } from '@/components/SensorStepper'
import FormStepper, { FormStep } from '@/components/FormStepper'

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
  const { width: screenWidth } = Dimensions.get('window')
  const [infoModalVisible, setInfoModalVisible] = useState<boolean>(false)

  // React Query Hooks
  const { data: formStatusData, refetch: refetchFormStatus } = useFormStatus()
  const { data: sensorSteppersData, refetch: refetchSensorSteppers } = useSensorSteppers()
  const { data: formSteppersData, refetch: refetchFormSteppers } = useFormSteppers()
  const { data: trackingData, refetch: refetchTracking } = useTrackingData()

  const formStatus = formStatusData || { inPhase: false, inTimeWindow: false, doneToday: false }

  const defaultSensorDays: DayStep[] = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((label) => ({
    label,
    status: 'empty',
    isTogglable: false
  }))

  const defaultFormDays: FormStep[] = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'].map((label) => ({
    label,
    status: 'empty',
    selected: false
  }))

  const sensorDays = sensorSteppersData?.days || defaultSensorDays
  const formDays = formSteppersData?.days || defaultFormDays

  const handleToggleSensorDay = async (stepDayIndex: number) => {
    try {
      await enqueueSensorToggle(stepDayIndex)
      refetchSensorSteppers()
    } catch (e) {
      console.error("Error toggling sensor day:", stepDayIndex, e)
    }
  }

  const currentJsDay = new Date().getDay()
  const currentDayIndex = currentJsDay === 0 ? 6 : currentJsDay - 1

  const sanitizeOpeningData = (openingList: any[]) => {
    if (!Array.isArray(openingList)) return []
    return openingList.map((item: any, index: number) => ({
      ...item,
      value: index > currentDayIndex ? 0 : (item.value || 0),
      frontColor: index === currentDayIndex ? theme.colors.primary : 'lightgray'
    }))
  }

  const openingAmount = trackingData?.amount || 0
  const exposureDuration = trackingData?.duration || 0
  const barData = sanitizeOpeningData(trackingData?.opening || [])

  const setupTelemetryAndNotifications = async () => {
    try {
      await Notifications.getDevicePushTokenAsync().then(async e => {
        await api.put('/notifications/token', { fcmToken: e.data })
      })

      await Notifications.setNotificationChannelAsync('sensor', {
        name: 'Rappels de port de capteur',
        description: 'Canal SENSOR',
        importance: Notifications.AndroidImportance.MAX
      })

      await Notifications.setNotificationChannelAsync('form', {
        name: 'Rappels de questionnaire',
        description: 'Canal FORM',
        importance: Notifications.AndroidImportance.MAX
      })

      const androidId = await AsyncStorage.getItem('androidId')
      await api.put('/telemetry/device', { androidId, device: Device })
    } catch (e) {
      console.error("Failed to setup telemetry:", e)
    }
  }

  useFocusEffect(
    useCallback(() => {
      refetchFormStatus()
      refetchSensorSteppers()
      refetchFormSteppers()
      refetchTracking()
      setupTelemetryAndNotifications()

      const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          refetchFormStatus()
          refetchSensorSteppers()
          refetchFormSteppers()
          refetchTracking()
        }
      })

      return () => {
        subscription.remove()
      }
    }, [refetchFormStatus, refetchSensorSteppers, refetchFormSteppers, refetchTracking])
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
        {formStatus.inPhase && formStatus.inTimeWindow && !formStatus.doneToday && (
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

        {!formStatus.inPhase && (
          <>
          <Text>DEMAIN</Text>
          </>
        )}

        {/* Section 2 : Progression cette semaine */}
        <Text variant="titleLarge" style={[styles.sectionHeader, { color: theme.colors.primary, marginTop: 24 }]}>
          Progression cette semaine
        </Text>

        {formStatus.inPhase && (
          <FormStepper
            title="Questionnaire quotidien"
            days={formDays}
            icon="clipboard-check-outline"
          />
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
