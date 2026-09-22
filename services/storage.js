import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'

export async function setStorageItem(key, value) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key)
    await AsyncStorage.removeItem(key)
  } else {
    await SecureStore.setItemAsync(key, value)
    await AsyncStorage.setItem(key, value) // Kotlin
  }
}

export async function getStorageItem(key) {
  try {
    const value = await SecureStore.getItemAsync(key)
    return value
  } catch (e) {
    console.error("Erreur lors de la lecture SecureStore:", e)
    return null
  }
}

export async function clearAllCaches() {
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
}