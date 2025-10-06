import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/contexts/auth'

import * as SAMCache from '../../services/cache/sam'

export default function AppLayout() {
  const { accessToken } = useSession()

  if (!accessToken) return <Redirect href="/(auth)/login" />

  if (accessToken) SAMCache.syncWithServer()

  return <Stack screenOptions={{ headerShown: false }} />
}