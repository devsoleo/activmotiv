import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Appbar, Button, Snackbar, useTheme, Card, Text, Icon } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import { api } from '@/services/api'

export default function AdminScreen() {
  const router = useRouter()
  const theme = useTheme()

  const [loadingSensor, setLoadingSensor] = useState(false)
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarText, setSnackbarText] = useState('')

  const handleSendNotification = async (type: 'SENSOR' | 'QUESTIONNAIRE') => {
    if (type === 'SENSOR') setLoadingSensor(true)
    else setLoadingQuestionnaire(true)

    try {
      // 1. Sync device push token with backend before triggering admin notification
      try {
        const pushToken = await Notifications.getDevicePushTokenAsync()
        if (pushToken?.data) {
          await api.put('/notifications/token', { fcmToken: pushToken.data })
        }
      } catch (tokenErr) {
        console.warn("Unable to sync push token before test notification:", tokenErr)
      }

      // 2. Request backend to send real FCM notification (same system as automated crons)
      const res = await api.post('/admin/notifications/send', { type })

      if (res.status === 200 && res.data) {
        const notifData = res.data.notification || {}
        const fcmStats = res.data.fcm || {}
        const isSensor = type === 'SENSOR'

        if (fcmStats.successCount > 0) {
          setSnackbarText(`Notification ${isSensor ? 'capteur' : 'questionnaire'} envoyée via le serveur (${fcmStats.successCount} appareil reçu) !`)
        } else {
          // Fallback if device token wasn't registered/active on FCM
          const title = notifData.title || (isSensor ? 'Rappel port du capteur' : 'Rappel questionnaire')
          const body = notifData.body || (isSensor
            ? "Bonjour, pensez à mettre le capteur à la taille aujourd'hui. Merci !"
            : "C'est l'heure de remplir votre questionnaire !")
          const url = notifData.url || (isSensor ? '/(sensor)' : '/(questionnaires)')
          const channelId = notifData.channelId || (isSensor ? 'sensor' : 'questionnaire')
          const color = notifData.color || (isSensor ? '#EF5350' : '#29B6F6')
          const imageUrl = notifData.imageUrl || (isSensor
            ? 'https://activmotiv.fr/static/notifications/sensor.png?key=b4b01d6c7472362a30ac5470aac7f6be'
            : 'https://activmotiv.fr/static/notifications/ema.png?key=b4b01d6c7472362a30ac5470aac7f6be')

          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              data: { type, url },
              attachments: imageUrl ? [{ identifier: 'image', url: imageUrl, type: 'image/png' }] : [],
              ...(channelId ? { android: { channelId, color } } : {}),
            },
            trigger: null,
          })

          setSnackbarText(`Notification locale de secours déclenchée (aucun jeton FCM actif trouvé).`)
        }
      } else {
        setSnackbarText(`Erreur lors de l'envoi de la notification.`)
      }
    } catch (e: any) {
      console.error(`Failed to send ${type} notification:`, e)
      const errorMsg = e.response?.data?.error || `Erreur d'envoi (${e.message || 'serveur'})`
      setSnackbarText(errorMsg)
    } finally {
      if (type === 'SENSOR') setLoadingSensor(false)
      else setLoadingQuestionnaire(false)
      setSnackbarVisible(true)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Administration" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card} mode="elevated">
          <Card.Content style={{ gap: 16 }}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primaryContainer }]}>
                <Icon source="bell-ring-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, flex: 1 }}>
                Envoi de notifications de démonstration
              </Text>
            </View>

            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Déclenchez instantanément une notification de démo sur cet appareil (réservé aux administrateurs).
            </Text>

            <Button
              mode="contained"
              icon="walk"
              loading={loadingSensor}
              disabled={loadingSensor || loadingQuestionnaire}
              onPress={() => handleSendNotification('SENSOR')}
              buttonColor="#EF5350"
              textColor="#FFFFFF"
              style={styles.button}
            >
              Envoyer une notification de capteur
            </Button>

            <Button
              mode="contained"
              icon="clipboard-check-outline"
              loading={loadingQuestionnaire}
              disabled={loadingSensor || loadingQuestionnaire}
              onPress={() => handleSendNotification('QUESTIONNAIRE')}
              buttonColor="#29B6F6"
              textColor="#FFFFFF"
              style={styles.button}
            >
              Envoyer une notification de questionnaire
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        duration={4000}
        onDismiss={() => setSnackbarVisible(false)}
      >
        {snackbarText}
      </Snackbar>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16
  },
  card: {
    borderRadius: 12
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    paddingVertical: 4,
    borderRadius: 8
  }
})
