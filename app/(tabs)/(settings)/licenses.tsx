import { useRouter } from 'expo-router'
import { Text } from 'react-native'
import { Appbar } from 'react-native-paper'

export default function Licenses() {
  const router = useRouter()

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {router.back()}} />
        <Appbar.Content title="Licences Open-Source" />
      </Appbar.Header>
      <Text></Text>
    </>
  )
}