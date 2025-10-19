import { api } from '@/services/api'

import { getCache, cleanCache, setItem } from '../cache'

export async function syncWithServer() {
  const cache = await getCache("questionnaire")

  api.put(`/questionnaire/cache`, { cache }).then(() => {
    cleanCache("questionnaire")
  })
}

export async function saveResults(label, header, results) {
  await setItem("questionnaire", label, [{ header, results, timestamp: Date.now() }])
}