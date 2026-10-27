import { MMKV } from 'react-native-mmkv'
import * as Network from 'expo-network'
import { api } from '@/services/api'

const storage = new MMKV()
const SENSORS_QUEUE_KEY = 'offline_queue_sensors'

export async function enqueueSensorToggle(weekDayIndex) {
  try {
    const raw = storage.getString(SENSORS_QUEUE_KEY)
    const queue = raw ? JSON.parse(raw) : []

    const newItem = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
      weekDayIndex,
      createdAt: Date.now(),
    }

    queue.push(newItem)
    storage.set(SENSORS_QUEUE_KEY, JSON.stringify(queue))

    // Tente de synchroniser immédiatement
    await syncSensors()
  } catch (e) {
    console.error("Error enqueuing sensor toggle:", e)
  }
}

export async function syncSensors() {
  try {
    const state = await Network.getNetworkStateAsync()
    if (!state.isConnected) return

    const raw = storage.getString(SENSORS_QUEUE_KEY)
    const queue = raw ? JSON.parse(raw) : []
    if (!queue.length) return

    const results = await Promise.all(
      queue.map(async (item) => {
        try {
          await api.post('/sensors/toggle', { weekDayIndex: item.weekDayIndex })
          return null
        } catch (e) {
          console.warn(
            `Failed to sync sensor toggle day ${item.weekDayIndex}, keeping in queue:`,
            e?.message || e
          )
          return item
        }
      })
    )

    const remaining = results.filter(Boolean)
    storage.set(SENSORS_QUEUE_KEY, JSON.stringify(remaining))
  } catch (e) {
    console.error('Error syncing sensors queue:', e)
  }
}