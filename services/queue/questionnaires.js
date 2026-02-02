import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/services/api'

export async function enqueueForm(key, label, payload) {
  const queue = JSON.parse(await AsyncStorage.getItem(key)) || []

  queue.push({
    label,
    payload,
    status: 'pending'
  })

  await AsyncStorage.setItem(key, JSON.stringify(queue))

  await syncForms(key)
}

export async function syncForms(key) {
  const queue = JSON.parse(await AsyncStorage.getItem(key)) || []
  const remaining = []

  for (const item of queue) {
    const { payload, label } = item

    await api.post(`/questionnaires/${label}`, { data: payload }).then(() => {
      console.log("Queue synchronized !", key)
    }).catch((e) => {
      console.log(e)
      remaining.push(item)
    })
  }

  await AsyncStorage.setItem(key, JSON.stringify(remaining))
}
