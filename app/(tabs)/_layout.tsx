import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/contexts/auth'

import * as SAMCache from '@/services/cache/sam'
import * as QuestionnaireCache from '@/services/cache/questionnaire'
import * as TrackingCache from '@/services/cache/tracking'

export default function AppLayout() {
  const { accessToken } = useSession()

  if (!accessToken) return <Redirect href="/(auth)/login" />

  if (accessToken) {
    SAMCache.syncWithServer()
    QuestionnaireCache.syncWithServer()
    TrackingCache.syncWithServer()
  }

  return <Stack screenOptions={{ headerShown: false }} />
}