import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, Button, Card, useTheme, IconButton } from 'react-native-paper'
import { useSession } from '@/contexts/auth'

interface PermissionsStepProps {
  handleNext: () => void
  isNextDisabled: () => boolean
  isLoading: boolean
}

export default function PermissionsStep({
  handleNext,
  isNextDisabled,
  isLoading
}: Readonly<PermissionsStepProps>) {
  const theme = useTheme()

  const { signOut } = useSession()

  return (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>
        Bienvenue dans ActivMotiv !
      </Text>
      <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
        {"Nous allons vous poser quelques questions afin de personnaliser au mieux votre expérience et d'adapter votre accompagnement quotidien."}
      </Text>

      <Card style={[styles.infoCard, { backgroundColor: theme.colors.elevation.level1 }]}>
        <Card.Content>
          <View style={styles.infoRow}>
            <IconButton icon="image-multiple" size={28} iconColor={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text variant="titleMedium" style={styles.infoTitle}>Etape 1 : Choix des images</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {"Sélectionnez des images neutres d'activités physiques et des images positives qui vous correspondent le plus"}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.infoCard, { backgroundColor: theme.colors.elevation.level1, marginTop: 12 }]}>
        <Card.Content>
          <View style={styles.infoRow}>
            <IconButton icon="clock-outline" size={28} iconColor={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text variant="titleMedium" style={styles.infoTitle}>Etape 2 : Planification des rappels</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {"Définissez vos heures de rappels matinaux pour vos questionnaires et le port de votre capteur."}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.infoCard, { backgroundColor: theme.colors.elevation.level1, marginTop: 12 }]}>
        <Card.Content>
          <View style={styles.infoRow}>
            <IconButton icon="shield-check-outline" size={28} iconColor={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text variant="titleMedium" style={styles.infoTitle}>Etape 3 : Permissions</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {"Accordez les autorisations nécessaires pour le bon fonctionnement des rappels et popups."}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={{ marginTop: 24, gap: 12 }}>
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={isNextDisabled()}
          loading={isLoading}
          style={styles.navButton}
        >
          Suivant
        </Button>

        <Button
          mode="outlined"
          textColor={theme.colors.error}
          icon="logout"
          onPress={signOut}
          style={[styles.navButton, { borderColor: theme.colors.error }]}
        >
          Se déconnecter
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 8
  },
  stepIndicatorText: {
    fontWeight: 'bold',
    color: 'rgb(114, 120, 126)',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  stepContainer: {
    padding: 20,
    gap: 12
  },
  stepTitle: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  infoTitle: {
    fontWeight: 'bold',
  },
  timeCard: {
    borderRadius: 12,
  },
  timeSectionTitle: {
    fontWeight: 'bold',
  },
  timeButton: {
    alignSelf: 'center',
    marginRight: 16,
  },
  summaryCard: {
    width: '100%',
    elevation: 2,
    borderRadius: 12,
    marginTop: 12,
    padding: 10,
    borderLeftWidth: 4,
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  summaryRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  navigationFooter: {
    height: 70,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  footerLeft: {
    flex: 1,
    alignItems: 'flex-start'
  },
  footerRight: {
    flex: 1,
    alignItems: 'flex-end'
  },
  navButton: {
    minWidth: 110,
    borderRadius: 20
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    zIndex: 100,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  floatingSettingsButton: {
    paddingVertical: 6,
    borderRadius: 24,
  }
})