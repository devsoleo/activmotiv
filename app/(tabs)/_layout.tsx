import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/contexts/auth'
import { useState, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Buffer } from 'buffer'
import { api } from '@/services/api'

import * as SAMCache from '@/services/cache/sam'
import * as TrackingCache from '@/services/cache/tracking'

export default function AppLayout() {
  const { accessToken } = useSession()
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null)

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!accessToken) {
        setIsOnboarded(false)
        return
      }
      try {
        const decoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
        const uid = decoded["uid"]
        
        // Query the server for onboarding status
        api.get('/auth/onboarding-status')
          .then((response) => response.data)
          .then(async (data) => {
            // Sync with local storage
            await AsyncStorage.setItem(`onboarded_${uid}`, data.onboarded ? 'true' : 'false')
            setIsOnboarded(data.onboarded)
          })
          .catch(async (err) => {
            console.log("Onboarding status server check failed, using offline cache:", err)
            // Offline fallback
            const onboarded = await AsyncStorage.getItem(`onboarded_${uid}`)
            setIsOnboarded(onboarded === 'true')
          })
      } catch (e) {
        console.error("Failed to check onboarding state:", e)
        setIsOnboarded(true) // Fail-safe: let the user pass if an error occurs
      }
    }
    checkOnboarding()
  }, [accessToken])

  if (!accessToken) return <Redirect href="/(auth)/login" />

  if (isOnboarded === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(252, 252, 255)' }}>
        <ActivityIndicator size="large" color="rgb(0, 99, 153)" />
      </View>
    )
  }

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />
  }

  SAMCache.syncWithServer()
  TrackingCache.syncWithServer()

  return <Stack screenOptions={{ headerShown: false }} />
}
