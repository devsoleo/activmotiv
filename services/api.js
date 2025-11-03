import axios from 'axios'
import { getStorageItem } from './storage'
import { callSignOut } from "@/contexts/authManager"
import { version } from '../package.json'

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': version
  }
})

api.defaults.timeout = 2000

api.interceptors.request.use(async (config) => {
  const accessToken = await getStorageItem('accessToken')

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  } else {
    callSignOut()
  }

  return config
})

api.interceptors.response.use((res) => {
    return res
  },
  (error) => {
    if (error.response && error.response.status === 412) {
      console.log("Une mise à jour est nécessaire")
      callSignOut()
    }

    return Promise.reject(error)
  }
)