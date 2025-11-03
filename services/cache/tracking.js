import { getItem, setItem } from '../cache'
import { api } from '../api'

export function syncWithServer() {

  // TODO : Add PUT

  api.get('/tracking')
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