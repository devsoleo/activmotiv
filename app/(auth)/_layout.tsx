import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/contexts/auth'
import { useTheme } from 'react-native-paper'

export default function AuthLayout() {
  const { accessToken } = useSession()
  const theme = useTheme()

  if (accessToken) return <Redirect href="/(tabs)" />

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
}
