import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, View, Linking } from 'react-native'
import { Appbar, Text, Button, Card, Divider } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function PermissionsScreen() {
  const router = useRouter()

  const handleOpenSettings = () => {
    Linking.openSettings()
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => { router.back() }} />
        <Appbar.Content title="Autorisations d'auto-ouverture" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always">
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {"Indispensables pour l'affichage des popups"}
        </Text>
        
        <Text style={styles.introText}>
          {"Pour que l'ouverture automatique des illustrations de motivation fonctionne correctement lorsque vous activez votre écran, certaines permissions Android doivent être accordées."}
        </Text>

        {/* 1. System Overlay Permission */}
        <Card style={styles.permissionCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={styles.permissionTitle}>
                {"1. Affichage par-dessus les autres applis"}
              </Text>
              <Text style={[styles.badge, styles.badgeRequired]}>{"Indispensable"}</Text>
            </View>
            <Text style={styles.cardDescription}>
              {"Cette autorisation permet à l'application d'afficher la fenêtre popup contenant vos images de motivation par-dessus l'écran actuel."}
            </Text>
            <Text style={styles.guideText}>
              {"👉 Comment l'activer : Cliquez sur le bouton ci-dessous, puis recherchez 'ActivMotiv' dans la liste et cochez 'Autoriser l'affichage sur d'autres applications'."}
            </Text>
          </Card.Content>
        </Card>

        {/* 2. Xiaomi / Redmi Permissions */}
        <Card style={styles.permissionCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={styles.permissionTitle}>
                {"2. Fenêtres contextuelles en arrière-plan"}
              </Text>
              <Text style={[styles.badge, styles.badgeRecommended]}>{"Xiaomi / Redmi"}</Text>
            </View>
            <Text style={styles.cardDescription}>
              {"Sur les appareils de marque Xiaomi, Redmi et POCO, le système bloque par défaut l'affichage d'écrans depuis l'arrière-plan."}
            </Text>
            <Text style={styles.guideText}>
              {"👉 Comment l'activer : Dans la page des paramètres de l'application, allez dans 'Autres autorisations' et autorisez 'Afficher les fenêtres pop-up en arrière-plan' et 'Afficher sur l'écran de verrouillage'."}
            </Text>
          </Card.Content>
        </Card>

        {/* 3. Battery Saver Exemption */}
        <Card style={styles.permissionCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={styles.permissionTitle}>
                {"3. Optimisation de la batterie"}
              </Text>
              <Text style={[styles.badge, styles.badgeRecommended]}>{"Recommandé"}</Text>
            </View>
            <Text style={styles.cardDescription}>
              {"Pour éviter que le système d'exploitation ne ferme de manière agressive le service d'auto-ouverture afin d'économiser de la batterie."}
            </Text>
            <Text style={styles.guideText}>
              {"👉 Comment l'activer : Dans les paramètres de l'application, allez dans 'Économiseur de batterie' ou 'Optimisation de batterie' et sélectionnez 'Pas de restrictions'."}
            </Text>
          </Card.Content>
        </Card>

        <Divider style={{ marginVertical: 12 }} />

        <Button 
          mode="contained" 
          onPress={handleOpenSettings} 
          style={styles.settingsButton}
          icon="cog"
          labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
        >
          {"Ouvrir les Paramètres d'ActivMotiv"}
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(252, 252, 255)'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: 'rgb(0, 29, 50)',
    marginBottom: 8
  },
  introText: {
    fontSize: 14,
    color: 'rgb(66, 71, 78)',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'justify'
  },
  permissionCard: {
    marginBottom: 16,
    elevation: 1,
    backgroundColor: 'white',
    borderRadius: 12
  },
  cardHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8
  },
  permissionTitle: {
    fontWeight: 'bold',
    color: 'rgb(0, 99, 153)',
    fontSize: 16,
    lineHeight: 22
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  badgeRequired: {
    backgroundColor: '#fde8e8',
    color: '#dc3545'
  },
  badgeRecommended: {
    backgroundColor: 'rgb(205, 229, 255)',
    color: 'rgb(0, 99, 153)'
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgb(26, 28, 30)',
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'justify'
  },
  guideText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgb(114, 120, 126)',
    backgroundColor: 'rgb(239, 244, 250)',
    padding: 10,
    borderRadius: 8,
    lineHeight: 18,
    textAlign: 'justify'
  },
  settingsButton: {
    marginTop: 12,
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: 'rgb(0, 99, 153)'
  }
})
