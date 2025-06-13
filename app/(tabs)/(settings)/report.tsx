import { useRouter } from 'expo-router'
import { Text } from 'react-native'
import { Appbar } from 'react-native-paper'

export default function Report() {
  const router = useRouter()

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {router.back()}} />
        <Appbar.Content title="Signaler un bug" />
      </Appbar.Header>
      <Text></Text>
    </>
  )
}