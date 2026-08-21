import { getItem, setItem } from '../cache'
import { api } from '../api'

export function syncQuestionnaireStatusWithServer() {
  return api.get('/questionnaires/status')
    .then((response) => response.data)
    .then(async (data) => {
      if (data && typeof data.display === 'boolean') {
        await setItem('questionnaires', 'display', data.display)
      }
      return data
    })
}

export async function getCachedQuestionnaireStatus() {
  const display = await getItem('questionnaires', 'display')
  return display
}
