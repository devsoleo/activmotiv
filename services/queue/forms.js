import { MMKV } from 'react-native-mmkv'
import * as Network from 'expo-network'
import { api } from '@/services/api'

const storage = new MMKV()
const QUEUE_PREFIX = 'offline_queue_'

export async function enqueueForm(key = 'forms', label = 'daily', payload) {
  const queueKey = `${QUEUE_PREFIX}${key}`
  try {
    const raw = storage.getString(queueKey)
    const queue = raw ? JSON.parse(raw) : []

    const newItem = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
      label,
      payload,
      createdAt: Date.now(),
    }

    queue.push(newItem)
    storage.set(queueKey, JSON.stringify(queue))

    // Tente immédiatement de synchroniser
    await syncForms(key)
  } catch (e) {
    console.error("Error enqueuing form:", e)
  }
}

export async function syncForms(key = 'forms') {
  const queueKey = `${QUEUE_PREFIX}${key}`
  try {
    const state = await Network.getNetworkStateAsync()
    if (!state.isConnected) return

    const raw = storage.getString(queueKey)
    const queue = raw ? JSON.parse(raw) : []
    if (!queue.length) return

    const remaining = []

    for (const item of queue) {
      try {
        await api.post(`/forms/${item.label}`, { data: item.payload })
      } catch (e) {
        console.warn(`Failed to sync form ${item.label}, keeping in queue:`, e?.message || e)
        remaining.push(item)
      }
    }

    storage.set(queueKey, JSON.stringify(remaining))
  } catch (e) {
    console.error("Error syncing forms queue:", e)
  }
}
