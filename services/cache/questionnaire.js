import { api } from '@/services/api'

import { getCache, cleanCache, setItem } from '../cache'

export async function syncWithServer() {
  const cache = await getCache("questionnaire")

  await api.put(`/questionnaires/cache`, { cache }).then(() => {
    cleanCache("questionnaire")
  })
}

export async function saveResults(label, header, results) {
  await setItem("questionnaire", label, [{ header, results, timestamp: Date.now() }])
  await syncWithServer()
}