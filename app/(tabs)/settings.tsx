import { useRouter } from 'expo-router'
import { StyleSheet, Linking } from 'react-native'
import { Text, Divider, List, useTheme } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSession } from '@/contexts/auth'

export default function SettingsScreen() {
  const theme = useTheme()
  const { signOut } = useSession()
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text variant="headlineLarge" style={styles.title}>Paramètres</Text>

      <List.Item
        onPress={() => router.push("./(settings)/profile")}
        title={<Text variant="titleMedium" style={styles.menu}>Mon profil</Text>}
        left={props => <List.Icon {...props} icon="account" />}
      />
      <Divider />
      <List.Item
        onPress={() => router.push("./(settings)/reminders")}
        title={<Text variant="titleMedium" style={styles.menu}>Mes rappels</Text>}
        left={props => <List.Icon {...props} icon="bell-outline" />}
      />
      <Divider />
      <List.Item
        onPress={() => router.push("./(settings)/permissions")}
        title={<Text variant="titleMedium" style={styles.menu}>{"Permissions"}</Text>}
        left={props => <List.Icon {...props} icon="security" />}
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
        title={<Text variant="titleMedium" style={styles.menu}>Licences Open-Source</Text>}
        left={props => <List.Icon {...props} icon="license" />}
      />
      <Divider />
      <List.Item
        onPress={() => Linking.openURL("https://sondage.umontpellier.fr/ls/index.php/325198?newtest=Y&lang=fr&uid=81fbdec3")}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingVertical: 12, fontWeight: "bold" },
  menu: { paddingTop: 15, paddingBottom: 15, paddingLeft: 15 },
})