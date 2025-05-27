import { BottomNavigation, Text, TouchableRipple, Icon, Button, Appbar, Divider } from 'react-native-paper';
import { useSession } from '@/contexts/auth'
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { signOut } = useSession()
  const router = useRouter()
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {router.replace("./home")}} />
        <Appbar.Content title="Paramètres" />
      </Appbar.Header>
      <View>
          <TouchableRipple
            onPress={() => {}}
            rippleColor="rgba(0, 0, 0, .06)"
          >
            <Text variant="titleMedium" style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 15 }}>Informations étude</Text>
          </TouchableRipple>
        <Divider />
          <TouchableRipple
            onPress={() => {}}
            rippleColor="rgba(0, 0, 0, .06)"
          >
            <Text variant="titleMedium" style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 15 }}>Contacts</Text>
          </TouchableRipple>
        <Divider />
          <TouchableRipple
            onPress={() => {}}
            rippleColor="rgba(0, 0, 0, .06)"
          >
            <Text variant="titleMedium" style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 15 }}>Licences Open-source</Text>
          </TouchableRipple>
        <Divider />
          <TouchableRipple
            onPress={() => console.log('Pressed')}
            rippleColor="rgba(255, 0, 0, .06)"
          >
            <Text variant="titleMedium" style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 15, color: "red", textAlign: 'center' }} onPress={signOut}>Se déconnecter</Text>
          </TouchableRipple>
      </View>
    </>
  )
}