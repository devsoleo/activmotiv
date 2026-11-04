import { StyleSheet, ScrollView } from 'react-native'
import { Text, Button, Card, useTheme, ActivityIndicator } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { api } from '@/services/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
const SENSOR_IMAGE_URL = 'https://activmotiv.fr/static/notifications/sensor.png?key=b4b01d6c7472362a30ac5470aac7f6be'

export default function SensorScreen() {
  const theme = useTheme()
  const router = useRouter()
  const queryClient = useQueryClient()

  const today = new Date().toDateString()

  const { data, isLoading: checking } = useQuery({
    queryKey: ['sensor-today', today],
    queryFn: async () => (await api.get('/sensors/today')).data,
  })

  const confirmMutation = useMutation({
    mutationFn: () => api.post('/sensors/validate/today'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sensor-today'] }),
  })

  const confirmed = !!data?.confirmed || confirmMutation.isSuccess

  if (checking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Rappel port du capteur
        </Text>

        <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 16 }}>
            <Image
              source={{ uri: SENSOR_IMAGE_URL }}
              style={styles.sensorImage}
              contentFit="contain"
            />

            {confirmed ? (
              <>
                <Text variant="titleMedium" style={{ textAlign: 'center', color: theme.colors.primary, marginBottom: 12 }}>
                  ✓ Port du capteur enregistré pour aujourd'hui
                </Text>
                <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
                  Merci d'avoir confirmé que vous portez bien votre capteur à la taille !
                </Text>
              </>
            ) : (
              <>
                <Text variant="titleMedium" style={{ textAlign: 'center', color: theme.colors.onSurface, marginBottom: 12 }}>
                  Avez-vous bien mis votre capteur de mouvement à la taille aujourd'hui ?
                </Text>
                <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
                  Portez-le en continu, sauf pour la douche ou les activités pouvant l'endommager.
                </Text>

                {confirmMutation.isError && (
                  <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 16, textAlign: 'center' }}>
                    Impossible d'enregistrer la confirmation. Veuillez réessayer.
                  </Text>
                )}

                <Button
                  mode="contained"
                  onPress={() => confirmMutation.mutate()}
                  loading={confirmMutation.isPending}
                  disabled={confirmMutation.isPending}
                  style={{ width: '100%', borderRadius: 12 }}
                  contentStyle={{ paddingVertical: 8 }}
                >
                  Je porte mon capteur
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: 24, alignSelf: 'center' }}
        >
          Retour à l'accueil
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
    padding: 8,
  },
  sensorImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
})
