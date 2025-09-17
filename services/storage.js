import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

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