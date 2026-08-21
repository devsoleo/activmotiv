import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { ScrollView, StyleSheet, View, Linking } from 'react-native'
import { Appbar, TextInput, Text, Button, Snackbar, useTheme, List, Divider } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import Clipboard from '@react-native-clipboard/clipboard'
import { Buffer } from 'buffer'
import { useSession } from '@/contexts/auth'
import { api } from '@/services/api'
import { getNetworkStateAsync } from 'expo-network'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TimePickerModal, registerTranslation, fr } from 'react-native-paper-dates'

registerTranslation('fr', fr)

export default function Profile() {
  const router = useRouter()
  const { accessToken } = useSession()
  const theme = useTheme()

  const [currentPassword, setCurrentPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [isCurrentPasswordSecure, setIsCurrentPasswordSecure] = useState(true)
  const [isNewPasswordSecure, setIsNewPasswordSecure] = useState(true)
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true)

  const [visible, setVisible] = useState(false)
  const [snackbarText, setSnackbarText] = useState('')

  const [weekHour, setWeekHour] = useState(8)
  const [weekendHour, setWeekendHour] = useState(10)
  const [sensorHour, setSensorHour] = useState(8)
  const [activePicker, setActivePicker] = useState<'week' | 'weekend' | 'sensor' | null>(null)

  const dismissSnackbar = () => setVisible(false)

  let uid = ''
  if (accessToken != null && accessToken !== undefined) {
    try {
      uid = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())['uid'] || ''
    } catch {
      uid = ''
    }
  }

  const parseHourFromStr = (val: string | null, fallback: number): number => {
    if (!val) return fallback
    const parsed = parseInt(val.split(':')[0], 10)
    if (isNaN(parsed) || parsed < 5 || parsed > 13) return fallback
    return parsed
  }

  useEffect(() => {
    if (!uid) return
    const loadReminderTimes = async () => {
      // 1. Load local cache first
      try {
        const savedWeek = await AsyncStorage.getItem(`questionnaire_hour_week_${uid}`)
        if (savedWeek) setWeekHour(parseHourFromStr(savedWeek, 8))

        const savedWeekend = await AsyncStorage.getItem(`questionnaire_hour_weekend_${uid}`)
        if (savedWeekend) setWeekendHour(parseHourFromStr(savedWeekend, 10))

        const savedSensor = await AsyncStorage.getItem(`sensor_hour_${uid}`)
        if (savedSensor) setSensorHour(parseHourFromStr(savedSensor, 8))
      } catch (e) {
        console.error('Failed to load local reminder times:', e)
      }

      // 2. Fetch from API if available
      try {
        const res = await api.get('/reminders')
        if (res.status === 200 && res.data) {
          const { questionnaire_week, questionnaire_weekend, sensor_daily } = res.data
          if (questionnaire_week !== undefined && questionnaire_week !== null) {
            const h = Number(questionnaire_week)
            setWeekHour(h)
            const formattedTime = `${String(h).padStart(2, '0')}:00`
            await AsyncStorage.setItem(`questionnaire_hour_week_${uid}`, formattedTime)
            await AsyncStorage.setItem(`questionnaire_hour_${uid}`, formattedTime)
          }
          if (questionnaire_weekend !== undefined && questionnaire_weekend !== null) {
            const h = Number(questionnaire_weekend)
            setWeekendHour(h)
            const formattedTime = `${String(h).padStart(2, '0')}:00`
            await AsyncStorage.setItem(`questionnaire_hour_weekend_${uid}`, formattedTime)
          }
          if (sensor_daily !== undefined && sensor_daily !== null) {
            const h = Number(sensor_daily)
            setSensorHour(h)
            const formattedTime = `${String(h).padStart(2, '0')}:00`
            await AsyncStorage.setItem(`sensor_hour_${uid}`, formattedTime)
          }
        }
      } catch (e) {
        console.warn('Could not sync reminders from API:', e)
      }
    }
    loadReminderTimes()
  }, [uid])

  const validateAndSaveTime = async (type: 'week' | 'weekend' | 'sensor', hours: number, minutes: number) => {
    setActivePicker(null)

    if (hours < 5 || hours > 13 || (hours === 13 && minutes > 0)) {
      setSnackbarText("L'heure de rappel doit être comprise entre 05h00 et 13h00.")
      setVisible(true)
      return
    }

    const selectedHour = hours
    const formattedTime = `${String(selectedHour).padStart(2, '0')}:00`

    let updatedWeek = weekHour
    let updatedWeekend = weekendHour
    let updatedSensor = sensorHour

    if (type === 'week') {
      updatedWeek = selectedHour
      setWeekHour(selectedHour)
      await AsyncStorage.setItem(`questionnaire_hour_week_${uid}`, formattedTime)
      await AsyncStorage.setItem(`questionnaire_hour_${uid}`, formattedTime)
    } else if (type === 'weekend') {
      updatedWeekend = selectedHour
      setWeekendHour(selectedHour)
      await AsyncStorage.setItem(`questionnaire_hour_weekend_${uid}`, formattedTime)
    } else if (type === 'sensor') {
      updatedSensor = selectedHour
      setSensorHour(selectedHour)
      await AsyncStorage.setItem(`sensor_hour_${uid}`, formattedTime)
    }

    // Sync with API
    try {
      const res = await api.put('/reminders', {
        questionnaire_week: updatedWeek,
        questionnaire_weekend: updatedWeekend,
        sensor_daily: updatedSensor,
      })

      if (res.status === 200) {
        setSnackbarText('Heure de rappel mise à jour !')
      } else {
        setSnackbarText('Enregistré en local.')
      }
      setVisible(true)
    } catch (e) {
      console.error('Failed to sync reminder time to API:', e)
      setSnackbarText('Enregistré en local (hors-ligne).')
      setVisible(true)
    }
  }

  const formatDisplayTime = (hour: number) => {
    return `${String(hour).padStart(2, '0')}:00`
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView keyboardShouldPersistTaps="always">
        <Appbar.Header statusBarHeight={0}>
          <Appbar.BackAction onPress={() => { router.back() }} />
          <Appbar.Content title="Mon profil" />
        </Appbar.Header>

        <Text variant="titleMedium" style={[styles.title, { marginTop: 16 }]}>Identifiant</Text>
        <View
          onTouchEnd={() => {
            Clipboard.setString(uid)
            setSnackbarText('UID copié dans le presse papier !')
            setVisible(true)
          }}>
          <TextInput
            value={uid}
            disabled
            style={{ margin: 16 }}
          />
        </View>

        <Divider style={{ marginVertical: 8 }} />

        <Text variant="titleMedium" style={styles.title}>Rappels matinaux questionnaire</Text>
        <List.Item
          title="Semaine (Lundi - Vendredi)"
          description="Entre 05h et 13h"
          right={() => (
            <Button mode="outlined" onPress={() => setActivePicker('week')} style={styles.timeButton}>
              {formatDisplayTime(weekHour)}
            </Button>
          )}
          left={(props) => <List.Icon {...props} icon="calendar-clock" />}
        />
        <Divider />
        <List.Item
          title="Week-end (Samedi - Dimanche)"
          description="Entre 05h et 13h"
          right={() => (
            <Button mode="outlined" onPress={() => setActivePicker('weekend')} style={styles.timeButton}>
              {formatDisplayTime(weekendHour)}
            </Button>
          )}
          left={(props) => <List.Icon {...props} icon="calendar-weekend" />}
        />

        <Divider style={{ marginVertical: 8 }} />

        <Text variant="titleMedium" style={styles.title}>Rappel port du capteur</Text>
        <List.Item
          title="Tous les matins"
          description="Entre 05h et 13h"
          right={() => (
            <Button mode="outlined" onPress={() => setActivePicker('sensor')} style={styles.timeButton}>
              {formatDisplayTime(sensorHour)}
            </Button>
          )}
          left={(props) => <List.Icon {...props} icon="watch-variant" />}
        />

        <Divider style={{ marginVertical: 8 }} />

        <Text variant="titleMedium" style={styles.title}>Modifier mon mot de passe</Text>
        <TextInput
          label="Mot de passe actuel"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={isCurrentPasswordSecure}
          right={<TextInput.Icon onPress={() => { isCurrentPasswordSecure ? setIsCurrentPasswordSecure(false) : setIsCurrentPasswordSecure(true) }} icon={isCurrentPasswordSecure ? 'eye' : 'eye-off'} />}
          style={{ margin: 16 }}
        />
        <TextInput
          label="Nouveau mot de passe"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={isNewPasswordSecure}
          right={<TextInput.Icon onPress={() => { isNewPasswordSecure ? setIsNewPasswordSecure(false) : setIsNewPasswordSecure(true) }} icon={isNewPasswordSecure ? 'eye' : 'eye-off'} />}
          style={{ margin: 16 }}
        />
        <TextInput
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={isConfirmPasswordSecure}
          right={<TextInput.Icon onPress={() => { isConfirmPasswordSecure ? setIsConfirmPasswordSecure(false) : setIsConfirmPasswordSecure(true) }} icon={isConfirmPasswordSecure ? 'eye' : 'eye-off'} />}
          style={{ margin: 16 }}
        />
        <Button mode="outlined" disabled={(newPassword.length === 0) || newPassword !== confirmPassword} style={{ margin: 16 }} onPress={async () => {
          const networkState = await getNetworkStateAsync()
          if (!networkState.isConnected) {
            setSnackbarText('Action impossible hors-ligne !')
            setVisible(true)
            return
          }

          try {
            const response = await api.post('/auth/reset-password', { current_password: currentPassword, new_password: newPassword })

            if (response.status === 200) {
              setSnackbarText('Votre mot de passe a bien été modifié !')
              setVisible(true)
            } else {
              setSnackbarText('Une erreur est survenue !')
              setVisible(true)
            }
          } catch (error) {
            setSnackbarText('Une erreur est survenue !')
            setVisible(true)
            console.error(error)
          }
        }}>
          Modifier mon mot de passe
        </Button>
      </ScrollView>

      <Button onPress={() => Linking.openURL('https://sondage.umontpellier.fr/ls/index.php/636317?lang=fr')} textColor="#EF5350" style={{ marginHorizontal: 16 }}>
        Supprimer mon compte
      </Button>

      <TimePickerModal
        visible={activePicker === 'week'}
        onDismiss={() => setActivePicker(null)}
        onConfirm={({ hours, minutes }) => validateAndSaveTime('week', hours, minutes)}
        hours={weekHour}
        minutes={0}
        use24HourClock
        locale="fr"
        label="Rappel questionnaire (semaine)"
        cancelLabel="Annuler"
        confirmLabel="Valider"
      />

      <TimePickerModal
        visible={activePicker === 'weekend'}
        onDismiss={() => setActivePicker(null)}
        onConfirm={({ hours, minutes }) => validateAndSaveTime('weekend', hours, minutes)}
        hours={weekendHour}
        minutes={0}
        use24HourClock
        locale="fr"
        label="Rappel questionnaire (week-end)"
        cancelLabel="Annuler"
        confirmLabel="Valider"
      />

      <TimePickerModal
        visible={activePicker === 'sensor'}
        onDismiss={() => setActivePicker(null)}
        onConfirm={({ hours, minutes }) => validateAndSaveTime('sensor', hours, minutes)}
        hours={sensorHour}
        minutes={0}
        use24HourClock
        locale="fr"
        label="Rappel port du capteur"
        cancelLabel="Annuler"
        confirmLabel="Valider"
      />

      <Snackbar
        visible={visible}
        duration={5000}
        onDismiss={dismissSnackbar}>
        {snackbarText}
      </Snackbar>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  title: { marginLeft: 16 },
  image: { borderRadius: 8 },
  timeButton: { alignSelf: 'center', marginRight: 16 },
})
