import axios from 'axios'
import { getStorageItem, setStorageItem } from './storage'
import { callSignOut } from "@/contexts/authManager"

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
  } else {
    callSignOut()
  }

  return config
})