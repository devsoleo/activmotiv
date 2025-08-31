import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/contexts/auth'

export default function AuthLayout() {
  const { accessToken } = useSession()

  if (accessToken) return <Redirect href="/(tabs)" />

  return <Stack screenOptions={{ headerShown: false }} />
}
