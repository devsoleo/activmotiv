import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/contexts/auth'
import { useTheme } from 'react-native-paper'

export default function SensorLayout() {
  const { accessToken } = useSession()
  const theme = useTheme()

  if (!accessToken) return <Redirect href="/(auth)/login" />

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
}
