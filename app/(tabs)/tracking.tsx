import { View, StyleSheet, ScrollView, AppState, AppStateStatus, Dimensions } from 'react-native'
import { Text, Card, Button, useTheme } from 'react-native-paper'
import { BarChart } from "react-native-gifted-charts"
import { useCallback, useState } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/services/api'
import { getTrackingItem, syncWithServer } from '@/services/cache/tracking'
import { getCachedQuestionnaireStatus, syncQuestionnaireStatusWithServer } from '@/services/cache/questionnaires'
import Task from '@/components/Task'

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

export default function TrackingScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { width: screenWidth } = Dimensions.get('window')
  
  // States pour le suivi
  const [barData, setBarData] = useState<any[]>([])
  const [openingAmount, setOpeningAmount] = useState<number>(0)
  const [exposureDuration, setExposureDuration] = useState<number>(0)
  
  // State pour les questionnaires
  const [displayQuestionnaire, setDisplayQuestionnaire] = useState<boolean>(false)

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

      const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          getTracking()
          getQuestionnairesAndTelemetry()
          
          const timer = setTimeout(() => {
            getTracking()
            getQuestionnairesAndTelemetry()
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
      <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>Suivi</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Section 1 : Questionnaires */}
        <Text variant="titleLarge" style={[styles.sectionHeader, { color: theme.colors.primary }]}>Vos questionnaires à compléter</Text>

        <Task
          item={{
            id: "1",
            uid: "t1",
            title: "Questionnaire quotidien",
            content: displayQuestionnaire ? "Vous avez un questionnaire à remplir !" : "Aucun questionnaire à remplir pour le moment.",
            action: { path: "/(questionnaires)/", text: "Remplir" }
          }}
          disabled={!displayQuestionnaire}
        />

        {/* Section 2 : Statistiques d'utilisation */}
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

            const chartProps: any = {
              disablePress: false,
              width: chartWidth,
              spacing: calculatedSpacing,
              initialSpacing: 25,
              barWidth: 22,
              barBorderRadius: 4,
              data: barData,
              maxValue: maxValue,
              noOfSections: 10,
              stepValue: stepValue,
              yAxisThickness: 0,
              xAxisThickness: 0,
              xAxisLabelTextStyle: { color: theme.colors.onSurface, fontSize: 11 },
              yAxisTextStyle: { color: theme.colors.onSurface },
              xAxisColor: theme.colors.outlineVariant,
              yAxisColor: theme.colors.outlineVariant,
              renderTooltip: (item: any) => (
                <View style={[styles.tooltip, { backgroundColor: theme.colors.primary }]}>
                  <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold', fontSize: 11 }}>
                    {item.value} {item.value > 1 ? 'ouvertures' : 'ouverture'}
                  </Text>
                </View>
              ),
              leftShiftForTooltip: 10,
              topShiftForTooltip: -15
            }
            return <BarChart {...(chartProps as any)} />
          })()}
        </View>

        <Text variant='bodySmall' style={[styles.chartLegend, { color: theme.colors.onSurfaceVariant }]}>
          Nombre d'expositions journalières
        </Text>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingVertical: 12, fontWeight: "bold" },
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
    marginVertical: 12,
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
