import { useRouter } from 'expo-router'
import { Text } from 'react-native'
import { Appbar, useTheme } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Licenses() {
  const router = useRouter()
  const theme = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {router.back()}} />
        <Appbar.Content title="Licences Open-Source" />
      </Appbar.Header>
      <Text></Text>
    </SafeAreaView>
  )
}