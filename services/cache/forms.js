import { api } from '../api'

export function syncFormStatusWithServer() {
  return api.get('/forms/status')
    .then((response) => response.data)
}
