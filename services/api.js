import axios from 'axios'
import { getStorageItem } from './storage'
import { callSignOut } from "@/contexts/authManager"
import { version } from '@/package.json'

const PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL
const APP_VERSION = version || process.env.npm_package_version

export const api = axios.create({
  baseURL: PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': APP_VERSION
  }
})

api.defaults.timeout = 15000

let isSigningOut = false

api.interceptors.request.use(async (config) => {
  config.baseURL = process.env.EXPO_PUBLIC_API_URL || config.baseURL
  const accessToken = await getStorageItem('accessToken')

  const isPublicRoute =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/first-login') ||
    config.url?.includes('/auth/logout')

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  } else if (!isPublicRoute && !isSigningOut) {
    isSigningOut = true
    try {
      await callSignOut()
    } finally {
      isSigningOut = false
    }
  }

  return config
})

api.interceptors.response.use(
  (res) => {
    return res
  },
  async (error) => {
    const status = error.response?.status
    const isLogoutUrl = error.config?.url?.includes('/auth/logout')

    if ((status === 401 || status === 403 || status === 412) && !isLogoutUrl && !isSigningOut) {
      isSigningOut = true
      if (status === 412) {
        console.log('Une mise à jour est nécessaire (412)')
      } else {
        console.log(`Session expirée ou non autorisée (${status})`)
      }
      try {
        await callSignOut()
      } finally {
        isSigningOut = false
      }
    }

    throw error;
  }
)