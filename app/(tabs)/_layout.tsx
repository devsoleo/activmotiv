import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/contexts/auth'
import { View, StyleSheet } from 'react-native'
import { Text, Button, ActivityIndicator, Icon, useTheme } from 'react-native-paper'
import { useOnboardingStatus } from '@/hooks/useOnboardingQueries'

export default function AppLayout() {
  const { accessToken } = useSession()
  const theme = useTheme()
  const { data: onboardingData, isLoading, isError, refetch } = useOnboardingStatus(Boolean(accessToken))

  if (!accessToken) return <Redirect href="/(auth)/login" />

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  // Si la vérification réseau a échoué et qu'aucune donnée n'est disponible en cache
  if (isError && !onboardingData) {
    return (
      <View style={[styles.centered, styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Icon source="wifi-off" size={64} color={theme.colors.error} />
        <Text variant="headlineSmall" style={[styles.errorTitle, { color: theme.colors.onBackground }]}>
          Erreur de connexion
        </Text>
        <Text variant="bodyMedium" style={[styles.errorMessage, { color: theme.colors.onSurfaceVariant }]}>
          Impossible de vérifier votre statut d'inscription en raison d'un problème réseau. Veuillez vérifier votre connexion Internet et réessayez.
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Réessayer
        </Button>
      </View>
    )
  }

  const isOnboarded = onboardingData ? Boolean(onboardingData.onboarded) : false

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContainer: {
    gap: 12,
  },
  errorTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
  },
})
