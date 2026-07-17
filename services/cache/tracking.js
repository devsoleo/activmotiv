import { getItem, setItem } from '../cache'
import { api } from '../api'

export function syncWithServer() {
  return api.get('/analytics/popup')
  .then((response) => response.data)
  .then(async (data) => {
    await setItem('tracking', 'amount', data.amount)
    await setItem('tracking', 'duration', data.duration)
    await setItem('tracking', 'opening', data.opening)
    return data
  })
}

export async function getTrackingItem(label) {
  const item = await getItem('tracking', label)

  return item
}