import { useRouter } from 'expo-router'
import { View, Linking, StyleSheet } from 'react-native'
import { Text, Appbar, List, useTheme } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Contacts() {
  const router = useRouter()
  const theme = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => {router.back()}} />
        <Appbar.Content title="Contacts" />
      </Appbar.Header>
      <Text variant="titleMedium" style={styles.title}>Responsables de projet</Text>
      <List.Item
        title="Rémy Dadier - remy.dadier@umontpellier.fr"
        description="Doctorant et Chef de projet"
        onPress={() => Linking.openURL('mailto:remy.dadier@umontpellier.fr')}
        left={props => <List.Icon {...props} icon="account" />}
      />
      <List.Item
        title="Julie Boiché - julie.boiche@umontpellier.fr"
        description="Directrice de thèse"
        onPress={() => Linking.openURL('mailto:julie.boiche@umontpellier.fr')}
        left={props => <List.Icon {...props} icon="account" />}
      />
      <List.Item
        title="Gérard Dray - gerard.dray@mines-ales.fr"
        description="Co-directreur de thèse"
        onPress={() => Linking.openURL('mailto:gerard.dray@mines-ales.fr')}
        left={props => <List.Icon {...props} icon="account" />}
      />
      <List.Item
        title="Noa Portelli - devsoleo@protonmail.com"
        description="Développeur"
        onPress={() => Linking.openURL('mailto:devsoleo@protonmail.com')}
        left={props => <List.Icon {...props} icon="account-hard-hat" />}
      />
      <List.Item
        title="Arch"
        description="Mascotte et Soutien psychologique"
        onPress={() => Linking.openURL('https://instagram.com/arch_le_manstre')}
        left={props => <List.Icon {...props} icon="dog" />}
      />
      <Text variant="titleMedium" style={styles.title}>Etablissement associé</Text>
      <List.Item
        title="Laboratoire EuroMov Digital Health in Motion"
        description="700 Av. du Pic Saint-Loup 34090 Montpellier, France"
        onPress={() => Linking.openURL('https://maps.app.goo.gl/uUDVRczFo4hFUuaS8')}
        left={props => <List.Icon {...props} icon="map-marker" />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  title: { paddingTop: 16, paddingLeft: 16 },
})