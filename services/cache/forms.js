import { getItem, setItem } from '../cache'
import { api } from '../api'

export function syncFormStatusWithServer() {
  return api.get('/forms/status')
    .then((response) => response.data)
    .then(async (data) => {
      if (data) await setItem('forms', 'status', data)
      return data
    })
}

export async function getCachedFormStatus() {
  const status = await getItem('forms', 'status')
  return status
}

export async function markFormAsDoneLocally() {
  const status = await getCachedFormStatus()
  if (status && typeof status === 'object') {
    await setItem('forms', 'status', { ...status, doneToday: true })
  } else {
    await setItem('forms', 'status', { inPhase: true, inTimeWindow: true, doneToday: true })
  }
}
