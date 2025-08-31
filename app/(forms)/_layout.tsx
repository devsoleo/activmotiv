import { Text } from 'react-native'
import { Redirect, Stack } from 'expo-router'

import { useSession } from '@/contexts/auth'

export default function FormsLayout() {
  const { accessToken } = useSession()

  if (!accessToken) return <Redirect href="/(auth)/login" />

  return <Stack screenOptions={{ headerShown: false }} />
}