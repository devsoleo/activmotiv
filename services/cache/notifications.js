import { getCache, setCache } from '../cache'

export function syncWithServer() {
  // api.put('/sam/all')
}

export async function saveResults(label, header, results) {
  const cache = (await getCache("questionnaire")) ?? {}

  cache[label] = { header, results, timestamp: Date.now() }

  setCache("questionnaire", cache)
}