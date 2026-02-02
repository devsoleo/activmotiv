import { getItem, setItem } from '../cache'
import { api } from '../api'

export function syncWithServer() {
  api.get('/analytics/popup')
  .then((response) => response.data)
  .then(async (data) => {
    await setItem('tracking', 'amount', data.amount)
    await setItem('tracking', 'opening', data.opening)
  })
}

export async function getTrackingItem(label) {
  const item = await getItem('tracking', label)

  return item
}