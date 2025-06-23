import { useRouter } from 'expo-router'
import { View, StyleSheet, Linking } from 'react-native'
import { Text, Divider, List } from 'react-native-paper'

import { useSession } from '@/contexts/auth'

export default function SettingsScreen() {
  const { signOut } = useSession()
  const router = useRouter()

  return (
    <View style={{ flex: 1}}>
        <Text variant="headlineLarge" style={styles.title}>Paramètres</Text>

        <List.Item
          onPress={() => router.push("./(settings)/profile")}
          title={<Text variant="titleMedium" style={styles.menu}>Mon profil</Text>}
          left={props => <List.Icon {...props} icon="account" />}
        />
        <Divider />
        <List.Item
          onPress={() => router.push("./(settings)/about")}
          title={<Text variant="titleMedium" style={styles.menu}>Informations étude</Text>}
          left={props => <List.Icon {...props} icon="rocket-outline" />}
        />
        <Divider />
        <List.Item
          onPress={() => router.push("./(settings)/contacts")}
          title={<Text variant="titleMedium" style={styles.menu}>Contacts</Text>}
          left={props => <List.Icon {...props} icon="contacts" />}
        />
        <Divider />
        <List.Item
          onPress={() => router.push("./(settings)/licenses")}
          title={<Text variant="titleMedium" style={styles.menu}>Licences Open-source</Text>}
          left={props => <List.Icon {...props} icon="license" />}
        />
        <Divider />
        <List.Item
          onPress={() => Linking.openURL("https://google.com")}
          title={<Text variant="titleMedium" style={styles.menu}>Signaler un bug</Text>}
          left={props => <List.Icon {...props} icon="bug" />}
        />
        <Divider />
        <List.Item
          onPress={signOut}
          title={<Text variant="titleMedium" style={[styles.menu, { color: "#EF5350" }]}>Se déconnecter</Text>}
          left={props => <List.Icon {...props} color={"#EF5350"} icon="logout" />}
        />
        <Divider />
    </View>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingTop: 45, paddingBottom: 15 },
  menu: { paddingTop: 15, paddingBottom: 15, paddingLeft: 15 },
})