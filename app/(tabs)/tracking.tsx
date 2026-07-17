import { View, StyleSheet, AppState, AppStateStatus } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { BarChart } from "react-native-gifted-charts"
import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getTrackingItem, syncWithServer } from '@/services/cache/tracking'

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
  const [barData, setBarData] = useState<any[]>([])
  const [openingAmount, setOpeningAmount] = useState<number>(0)
  const [exposureDuration, setExposureDuration] = useState<number>(0)

  const getTracking = async () => {
    const currentJsDay = new Date().getDay()
    const currentDayIndex = currentJsDay === 0 ? 6 : currentJsDay - 1

    // 1. Load from local cache for instant offline-first rendering
    try {
      const cachedAmount = await getTrackingItem('amount')
      const cachedDuration = await getTrackingItem('duration')
      const cachedOpening = await getTrackingItem('opening')

      if (cachedAmount !== undefined) setOpeningAmount(cachedAmount)
      if (cachedDuration !== undefined) setExposureDuration(cachedDuration)
      if (cachedOpening) {
        setBarData(cachedOpening.map((item: any, index: number) => ({
          ...item,
          frontColor: index === currentDayIndex ? theme.colors.primary : 'lightgray'
        })))
      }
    } catch (e) {
      console.error("Failed to load tracking from cache:", e)
    }

    // 2. Fetch updates from server in the background and refresh state
    try {
      const data = await syncWithServer()
      if (data) {
        setOpeningAmount(data.amount)
        setExposureDuration(data.duration)
        if (data.opening) {
          setBarData(data.opening.map((item: any, index: number) => ({
            ...item,
            frontColor: index === currentDayIndex ? theme.colors.primary : 'lightgray'
          })))
        }
      }
    } catch (e) {
      console.error("Failed to sync tracking with server:", e)
    }
  }

  useFocusEffect(
    useCallback(() => {
      getTracking()

      // Add AppState listener to refresh data in real-time when coming back from a popup
      const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          // 1. Refresh immediately to check for instant local cache updates or start immediate sync
          getTracking()
          
          // 2. Refresh again after 800ms to resolve potential server race condition
          // (allowing the background PUT request from the native side to finish processing on the server)
          const timer = setTimeout(() => {
            getTracking()
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

      <View style={styles.statsContainer}>
        <View style={[styles.stat, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant='titleMedium' style={{ color: theme.colors.onPrimaryContainer }}>Nombre d'expositions</Text>
          <Text variant='titleMedium' style={[styles.stat_value, { color: theme.colors.onPrimaryContainer }]}>{ openingAmount }</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant='titleMedium' style={{ color: theme.colors.onPrimaryContainer }}>Temps d'exposition</Text>
          <Text variant='titleMedium' style={[styles.stat_value, { color: theme.colors.onPrimaryContainer }]}>{ formatDuration(exposureDuration) }</Text>
        </View>
      </View>

      <View style={{ marginHorizontal: 12, zIndex: 10, overflow: 'visible' }}>
        {(() => {
          const chartProps: any = {
            disablePress: false,
            barWidth: 25,
            barBorderRadius: 4,
            data: barData,
            yAxisThickness: 0,
            xAxisThickness: 0,
            stepValue: 10,
            xAxisLabelTextStyle: { color: theme.colors.onSurface, fontSize: 11 },
            yAxisTextStyle: { color: theme.colors.onSurface },
            xAxisColor: theme.colors.outlineVariant,
            yAxisColor: theme.colors.outlineVariant,
            renderTooltip: (item: any) => (
              <View style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 6,
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }}>
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

      <Text variant='titleMedium' style={[{marginTop: 20, textAlign: 'center', color: theme.colors.onSurfaceVariant}]}>Nombres d'expositions journalières</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingVertical: 12, fontWeight: "bold" },
  statsContainer: {
    flexDirection: 'row', // côte à côte
    justifyContent: 'space-evenly', 
    paddingHorizontal: 10,
    marginBottom: 50
  },
  stat: { 
    backgroundColor: 'rgb(205, 229, 255)',
    borderRadius: 18,
    padding: 16,
    flex: 1,
    marginHorizontal: 5,
  },
  stat_value: {
    marginTop: 6,
    fontSize: 20
  }
})
