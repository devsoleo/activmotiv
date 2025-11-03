import  { useEffect, useCallback, useReducer } from 'react'
import { getStorageItem, setStorageItem } from '@/services/storage'

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void]

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>
}

export function useStorageState(key: string): UseStateHook<string> {
  // Public
  const [state, setState] = useAsyncState<string>()

  // Get
  useEffect(() => {
    getStorageItem(key).then(value => {
      setState(value)
    })
  }, [key])

  // Set
  const setValue = useCallback(
    (value: string | null) => {
      setState(value)
      setStorageItem(key, value)
    },
    [key]
  )

  return [state, setValue]
}
