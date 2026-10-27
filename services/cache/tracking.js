import { api } from '../api'

export function syncWithServer() {
  return api.get('/analytics/popup')
    .then((response) => response.data)
}

export function syncSteppersWithServer(type) {
  return api.get(`/${type}/stepper`)
    .then((response) => response.data)
}

export async function getCachedSteppers() {
  return null
}

export async function getTrackingItem() {
  return undefined
}
