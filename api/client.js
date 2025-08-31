import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.defaults.timeout = 2000

// Ajouter accessToken dans chaque requête
api.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync('accessToken')

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }

  return config
})

// Gestion des refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const currentRefreshToken = await SecureStore.getItemAsync('refreshToken')

    if (error.response?.status === 403 && currentRefreshToken && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/refresh`, {
          refreshToken: currentRefreshToken,
        })

        const { accessToken, refreshToken } = res.data

        await SecureStore.setItemAsync('accessToken', accessToken)
        await SecureStore.setItemAsync('refreshToken', refreshToken)

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`

        return api(originalRequest)
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)
