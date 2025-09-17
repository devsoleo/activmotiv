import axios from 'axios'
import { getStorageItem, setStorageItem } from './storage'
import { callSignOut } from "@/contexts/authManager"

let isRefreshing = false
let refreshSubscribers = []

// Permet de stocker les callbacks des requêtes en attente
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token) {
  refreshSubscribers.map(cb => cb(token))
  refreshSubscribers = []
}

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.defaults.timeout = 2000

// Ajouter accessToken dans chaque requête
api.interceptors.request.use(async (config) => {
  const accessToken = await getStorageItem('accessToken')

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }

  return config
})

// TODO : move to AuthProvider
const refreshToken = async (currentRefreshToken) => {
  const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, { refreshToken: currentRefreshToken })

  const { accessToken, refreshToken } = res.data

  await setStorageItem('accessToken', accessToken)
  await setStorageItem('refreshToken', refreshToken)

  return { accessToken, refreshToken }
}

// Gestion des refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const currentRefreshToken = await getStorageItem('refreshToken')

    if (error.response?.status === 403 && currentRefreshToken && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          await refreshToken(currentRefreshToken).then((newTokens) => {
            originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`
            onRefreshed(newTokens.accessToken)
          })

          return api(originalRequest)
        } catch (err) {
          callSignOut()

          return Promise.reject(err)
        } finally {
          isRefreshing = false
        }
      }

      return new Promise(resolve => {
        subscribeTokenRefresh(token => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`
          resolve(api(originalRequest))
        })
      })
    }

    return Promise.reject(error)
  }
)
