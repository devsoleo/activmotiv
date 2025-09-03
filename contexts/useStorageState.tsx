import * as SecureStore from 'expo-secure-store'
import  { useEffect, useCallback, useReducer } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void]

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key)
    await AsyncStorage.removeItem(key)
  } else {
    await SecureStore.setItemAsync(key, value)
    await AsyncStorage.setItem(key, value) // Kotlin
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  // Public
  const [state, setState] = useAsyncState<string>()

  // Get
  useEffect(() => {
    SecureStore.getItemAsync(key).then(value => {
      setState(value)
    })
  }, [key])

  // Set
  const setValue = useCallback(
    (value: string | null) => {
      setState(value)
      setStorageItemAsync(key, value)
    },
    [key]
  )

  return [state, setValue]
}
