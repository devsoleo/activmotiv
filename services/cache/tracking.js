import { getItem, setItem } from '../cache'
import { api } from '../api'

function getCurrentWeekMonday() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().split('T')[0]
}

export function syncWithServer() {
  return api.get('/analytics/popup')
  .then((response) => response.data)
  .then(async (data) => {
    await setItem('tracking', 'weekStart', getCurrentWeekMonday())
    await setItem('tracking', 'amount', data.amount)
    await setItem('tracking', 'duration', data.duration)
    await setItem('tracking', 'opening', data.opening)
    return data
  })
}

export function syncSteppersWithServer() {
  return api.get('/analytics/steppers')
    .then((response) => response.data)
    .then(async (data) => {
      if (data) {
        await setItem('tracking', 'steppers', data)
      }
      return data
    })
}

export async function getCachedSteppers() {
  const steppers = await getItem('tracking', 'steppers')
  return steppers
}

export async function getTrackingItem(label) {
  const item = await getItem('tracking', label)

  return item
}
