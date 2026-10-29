import React from 'react'
import { StyleSheet, View, Linking } from 'react-native'
import { Text, Button, Card, useTheme } from 'react-native-paper'

interface PermissionsStepProps {
  isAtBottom?: boolean
  hasScrolledToBottom?: boolean
}

export default function PermissionsStep({
  isAtBottom = false,
  hasScrolledToBottom = false
}: PermissionsStepProps) {
  const theme = useTheme()

  const handleOpenSettings = () => {
    Linking.openSettings()
  }

  return (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>
        Configuration des permissions
      </Text>

      <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
        {"Pour que l'ouverture automatique des images fonctionne correctement lorsque vous activez votre écran, certaines permissions Android doivent être accordées."}
      </Text>

      {!hasScrolledToBottom && (
        <View style={[styles.hintCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
          <Text style={[styles.hintText, { color: theme.colors.onTertiaryContainer }]}>
            {"👇 Veuillez faire défiler la page jusqu'en bas pour prendre connaissance de toutes les permissions et pouvoir continuer."}
          </Text>
        </View>
      )}

      {/* 1. System Overlay Permission */}
      <Card style={styles.permissionCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleLarge" style={[styles.permissionTitle, { color: theme.colors.primary }]}>
              {"1. Affichage par-dessus les autres applis"}
            </Text>
            <Text style={[styles.badge, { backgroundColor: theme.colors.errorContainer, color: theme.colors.onErrorContainer }]}>
              {"Indispensable"}
            </Text>
          </View>
          <Text style={[styles.cardDescription, { color: theme.colors.onSurface }]}>
            {"Cette autorisation permet à l'application d'afficher la fenêtre popup contenant vos images par-dessus l'écran actuel."}
          </Text>
          <Text style={[styles.guideText, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant }]}>
            {"👉 Comment l'activer : Cliquez sur le bouton ci-dessous, puis recherchez 'ActivMotiv' dans la liste et cochez 'Autoriser l'affichage sur d'autres applications'."}
          </Text>
        </Card.Content>
      </Card>

      {/* 2. Xiaomi / Redmi Permissions */}
      <Card style={styles.permissionCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleLarge" style={[styles.permissionTitle, { color: theme.colors.primary }]}>
              {"2. Fenêtres contextuelles en arrière-plan"}
            </Text>
            <Text style={[styles.badge, { backgroundColor: theme.colors.primaryContainer, color: theme.colors.onPrimaryContainer }]}>
              {"Xiaomi / Redmi"}
            </Text>
          </View>
          <Text style={[styles.cardDescription, { color: theme.colors.onSurface }]}>
            {"Sur les appareils de marque Xiaomi, Redmi et POCO, le système bloque par défaut l'affichage d'écrans depuis l'arrière-plan."}
          </Text>
          <Text style={[styles.guideText, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant }]}>
            {"👉 Comment l'activer : Dans la page des paramètres de l'application, allez dans 'Autres autorisations' et autorisez 'Afficher les fenêtres pop-up en arrière-plan' et 'Afficher sur l'écran de verrouillage'."}
          </Text>
        </Card.Content>
      </Card>

      {/* 3. Battery Saver Exemption */}
      <Card style={styles.permissionCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleLarge" style={[styles.permissionTitle, { color: theme.colors.primary }]}>
              {"3. Optimisation de la batterie"}
            </Text>
            <Text style={[styles.badge, { backgroundColor: theme.colors.primaryContainer, color: theme.colors.onPrimaryContainer }]}>
              {"Recommandé"}
            </Text>
          </View>
          <Text style={[styles.cardDescription, { color: theme.colors.onSurface }]}>
            {"Pour éviter que le système d'exploitation ne ferme de manière agressive le service d'auto-ouverture afin d'économiser de la batterie."}
          </Text>
          <Text style={[styles.guideText, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant }]}>
            {"👉 Comment l'activer : Dans les paramètres de l'application, allez dans 'Économiseur de batterie' ou 'Optimisation de batterie' et sélectionnez 'Pas de restrictions'."}
          </Text>
        </Card.Content>
      </Card>

      {/* 4. Auto-start / Redémarrage automatique */}
      <Card style={styles.permissionCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleLarge" style={[styles.permissionTitle, { color: theme.colors.primary }]}>
              {"4. Démarrage et redémarrage automatique"}
            </Text>
            <Text style={[styles.badge, { backgroundColor: theme.colors.errorContainer, color: theme.colors.onErrorContainer }]}>
              {"Indispensable"}
            </Text>
          </View>
          <Text style={[styles.cardDescription, { color: theme.colors.onSurface }]}>
            {"Cette autorisation permet à l'application de démarrer automatiquement au démarrage du téléphone et de se relancer en arrière-plan pour assurer l'envoi des rappels et popups."}
          </Text>
          <Text style={[styles.guideText, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant }]}>
            {"👉 Comment l'activer : Dans les paramètres de votre téléphone ou de l'application, activez l'option 'Démarrage automatique' (ou 'Auto-start' / 'Lancement automatique en arrière-plan')."}
          </Text>
        </Card.Content>
      </Card>

      {/* Button inline when scrolled to bottom */}
      {isAtBottom && (
        <Button
          mode="contained"
          onPress={handleOpenSettings}
          style={[styles.settingsButton, { backgroundColor: theme.colors.primary }]}
          icon="cog"
          labelStyle={{ fontWeight: 'bold', fontSize: 15, color: theme.colors.onPrimary }}
        >
          {"Ouvrir les Paramètres d'ActivMotiv"}
        </Button>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  stepContainer: {
    padding: 20,
    gap: 12,
  },
  stepTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  hintCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  permissionCard: {
    marginBottom: 12,
    elevation: 1,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  permissionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'justify',
  },
  guideText: {
    fontSize: 13,
    fontWeight: '500',
    padding: 10,
    borderRadius: 8,
    lineHeight: 18,
    textAlign: 'justify',
  },
  settingsButton: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 24,
  },
})
