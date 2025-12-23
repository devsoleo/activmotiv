import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/services/api'

export async function enqueueForm(key, data) {
  const queue = JSON.parse(await AsyncStorage.getItem(key)) || []

  queue.push({
    payload: data,
    status: 'pending'
  })

  await AsyncStorage.setItem(key, JSON.stringify(queue))

  await syncForms(key)
}

export async function syncForms(key) {
  const queue = JSON.parse(await AsyncStorage.getItem(key)) || []
  const remaining = []

  for (const item of queue) {
    await api.put(`/questionnaires/queue`, { item: item.payload }).then(() => {
      console.log("Queue synchronized !", key)
    }).catch((e) => {
      console.log(e)
      remaining.push(item)
    })
  }

  await AsyncStorage.setItem(key, JSON.stringify(remaining))
}
