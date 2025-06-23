import { useRouter } from 'expo-router'
import { Linking, StyleSheet } from 'react-native'
import { Text, Appbar, List } from 'react-native-paper'

export default function Contacts() {
  const router = useRouter()

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {router.back()}} />
        <Appbar.Content title="Contacts" />
      </Appbar.Header>
      <Text variant="titleMedium" style={styles.title}>Responsables de projet</Text>
      <List.Item
        title="Julie Boiché - julie.boiche@umontpellier.fr"
        description="Directrice de thèse"
        onPress={() => Linking.openURL('mailto:julie.boiche@umontpellier.fr')}
        left={props => <List.Icon {...props} icon="account" />}
      />
      <List.Item
        title="Rémy Dadier - remy.dadier@umontpellier.fr"
        description="Doctorant - Chef de projet"
        onPress={() => Linking.openURL('mailto:remy.dadier@umontpellier.fr')}
        left={props => <List.Icon {...props} icon="account" />}
      />
      <List.Item
        title="Noa Portelli - devsoleo@protonmail.com"
        description="Développeur"
        onPress={() => Linking.openURL('mailto:devsoleo@protonmail.com')}
        left={props => <List.Icon {...props} icon="account-hard-hat" />}
      />
      <Text variant="titleMedium" style={styles.title}>Etablissement associé</Text>
      <List.Item
        title="Laboratoire EuroMov Digital Health in Motion"
        description="700 Av. du Pic Saint-Loup 34090 Montpellier, France"
        onPress={() => Linking.openURL('https://maps.app.goo.gl/uUDVRczFo4hFUuaS8')}
        left={props => <List.Icon {...props} icon="map-marker" />}
      />
    </>
  )
}

const styles = StyleSheet.create({
  title: { paddingTop: 16, paddingLeft: 16 },
})