import { QueryClient, onlineManager } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import * as Network from 'expo-network'
import { MMKV } from 'react-native-mmkv'
import { syncForms } from '@/services/queue/forms'
import { syncSensors } from '@/services/queue/sensors'

// Configurer la détection de réseau automatique
onlineManager.setEventListener((setOnline) => {
  const subscription = Network.addNetworkStateListener((state) => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false)
    setOnline(isOnline)
    if (isOnline) {
      // Vider les files d'attente hors-ligne dès que le réseau revient
      syncForms()
      syncSensors()
    }
  })
  return () => {
    subscription.remove()
  }
})

export const mmkvStorage = new MMKV()

export const clientStorage = {
  setItem: (key: string, value: string) => {
    mmkvStorage.set(key, value)
    return Promise.resolve()
  },
  getItem: (key: string) => {
    const value = mmkvStorage.getString(key)
    return Promise.resolve(value ?? null)
  },
  removeItem: (key: string) => {
    mmkvStorage.delete(key)
    return Promise.resolve()
  },
}

export const queryPersister = createAsyncStoragePersister({ storage: clientStorage })

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 heures
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})
