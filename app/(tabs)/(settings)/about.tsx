import { useRouter } from 'expo-router'
import { Text } from 'react-native'
import { Appbar } from 'react-native-paper'

export default function About() {
  const router = useRouter()

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {router.back()}} />
        <Appbar.Content title="Informations étude" />
      </Appbar.Header>
      <Text></Text>
    </>
  )
}