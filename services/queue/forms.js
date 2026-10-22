import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/services/api'
import { markFormAsDoneLocally } from '@/services/cache/forms'

const CACHED_RESULTS_KEY = 'cached_forms_results'

export async function saveLocalResult(label, payload) {
  try {
    const raw = await AsyncStorage.getItem(CACHED_RESULTS_KEY)
    const history = raw ? JSON.parse(raw) : []
    history.push({
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
      label,
      payload,
      savedAt: Date.now()
    })
    await AsyncStorage.setItem(CACHED_RESULTS_KEY, JSON.stringify(history))
  } catch (e) {
    console.error("Failed to save local questionnaire result:", e)
  }
}

export async function getLocalResults(label) {
  try {
    const raw = await AsyncStorage.getItem(CACHED_RESULTS_KEY)
    const history = raw ? JSON.parse(raw) : []
    return label ? history.filter((item) => item.label === label) : history
  } catch (e) {
    console.error("Failed to get local questionnaire results:", e)
    return []
  }
}

export async function enqueueForm(key, label, payload) {
  try {
    const raw = await AsyncStorage.getItem(key)
    const queue = raw ? JSON.parse(raw) : []

    queue.push({
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
      label,
      payload,
      status: 'pending',
      createdAt: Date.now()
    })

    await AsyncStorage.setItem(key, JSON.stringify(queue))

    // Sauvegarde également dans l'historique local hors-ligne
    await saveLocalResult(label, payload)

    if (label === 'daily' || key === 'forms') {
      await markFormAsDoneLocally()
    }

    // Tente immédiatement de synchroniser avec le serveur
    await syncForms(key)
  } catch (e) {
    console.error("Error enqueuing questionnaire form:", e)
  }
}

export async function syncForms(key = 'forms') {
  try {
    const raw = await AsyncStorage.getItem(key)
    const queue = raw ? JSON.parse(raw) : []
    if (!queue.length) return

    const remaining = []

    for (const item of queue) {
      const { payload, label } = item

      try {
        await api.post(`/forms/${label}`, { data: payload })
      } catch (e) {
        console.warn("Failed to sync queue item, keeping in offline cache:", e?.message || e)
        remaining.push(item)
      }
    }

    await AsyncStorage.setItem(key, JSON.stringify(remaining))
  } catch (e) {
    console.error("Error syncing forms:", e)
  }
}
