import { Redirect, Stack } from 'expo-router'
import { Text } from 'react-native'
import { useSession } from '../../contexts/auth'

export default function AuthLayout() {
  const { session, isLoading } = useSession()

  if (isLoading) return <Text>Loading...</Text>
  if (session) return <Redirect href="/(tabs)/home" />

  return <Stack screenOptions={{ headerShown: false }} />
}
