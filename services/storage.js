import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MMKV } from 'react-native-mmkv'
import { Image } from 'expo-image'
import * as FileSystem from 'expo-file-system'
import { queryClient } from './queryClient'

const mmkvStorage = new MMKV()

export async function setStorageItem(key, value) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key)
    if (key === 'accessToken') {
      await AsyncStorage.removeItem(key)
    }
    mmkvStorage.delete(key)
  } else {
    await SecureStore.setItemAsync(key, value)
    if (key === 'accessToken') {
      await AsyncStorage.setItem(key, value) // Kotlin (Api.kt) lit le token depuis AsyncStorage
    }
    mmkvStorage.set(key, value)
  }
}

export async function getStorageItem(key) {
  try {
    const value = await SecureStore.getItemAsync(key)
    if (value != null) return value
    return mmkvStorage.getString(key) ?? null
  } catch (e) {
    console.error("Erreur lors de la lecture SecureStore:", e)
    return mmkvStorage.getString(key) ?? null
  }
}

export async function clearAllCaches() {
  try {
    mmkvStorage.clearAll()
    console.log("MMKV vidé avec succès")
  } catch (e) {
    console.error("Erreur lors du nettoyage de MMKV:", e)
  }

  try {
    await AsyncStorage.clear()
    console.log("AsyncStorage vidé avec succès")
  } catch (e) {
    console.error("Erreur lors du nettoyage d'AsyncStorage:", e)
  }

  try {
    await SecureStore.deleteItemAsync('accessToken')
    console.log("SecureStore (accessToken) vidé avec succès")
  } catch (e) {
    console.error("Erreur lors du nettoyage de SecureStore:", e)
  }

  try {
    if (Image?.clearMemoryCache) await Image.clearMemoryCache()
    if (Image?.clearDiskCache) await Image.clearDiskCache()
    console.log("Cache d'images vidé avec succès")
  } catch (e) {
    console.error("Erreur lors du nettoyage du cache d'images:", e)
  }

  try {
    queryClient.clear()
    console.log("QueryClient React Query vidé avec succès")
  } catch (e) {
    console.error("Erreur lors du nettoyage de QueryClient:", e)
  }

  try {
    if (FileSystem.cacheDirectory) {
      const staticCacheDir = `${FileSystem.cacheDirectory}static_cache`
      const dirInfo = await FileSystem.getInfoAsync(staticCacheDir)
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(staticCacheDir, { idempotent: true })
        console.log("Cache Kotlin static_cache vidé avec succès")
      }
    }
  } catch (e) {
    console.error("Erreur lors du nettoyage du dossier static_cache Kotlin:", e)
  }
}