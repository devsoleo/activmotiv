import { getItem, setItem } from '../cache'
import { api } from '../api'

export function syncFormStatusWithServer() {
  return api.get('/forms/status')
    .then((response) => response.data)
    .then(async (data) => {
      if (data && typeof data.display === 'boolean') {
        await setItem('forms', 'display', data.display)
      }
      return data
    })
}

export async function getCachedFormStatus() {
  const display = await getItem('forms', 'display')
  return display
}
