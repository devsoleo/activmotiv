import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { Appbar, Button, Snackbar, useTheme, List, Divider, Text, Portal, Dialog } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Buffer } from 'buffer'
import { useSession } from '@/contexts/auth'
import { api } from '@/services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TimePickerModal, registerTranslation, fr } from 'react-native-paper-dates'

registerTranslation('fr', fr)

export type DayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
export type ReminderType = 'QUESTIONNAIRE' | 'SENSOR'

export type ReminderSchedule = Record<DayKey, string>

export interface RemindersState {
  QUESTIONNAIRE: ReminderSchedule
  SENSOR: ReminderSchedule
}

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'MON', label: 'Lundi', short: 'Lun' },
  { key: 'TUE', label: 'Mardi', short: 'Mar' },
  { key: 'WED', label: 'Mercredi', short: 'Mer' },
  { key: 'THU', label: 'Jeudi', short: 'Jeu' },
  { key: 'FRI', label: 'Vendredi', short: 'Ven' },
  { key: 'SAT', label: 'Samedi', short: 'Sam' },
  { key: 'SUN', label: 'Dimanche', short: 'Dim' },
]

const DEFAULT_REMINDERS: RemindersState = {
  QUESTIONNAIRE: {
    MON: '08:00',
    TUE: '08:00',
    WED: '08:00',
    THU: '08:00',
    FRI: '08:00',
    SAT: '10:00',
    SUN: '10:00',
  },
  SENSOR: {
    MON: '08:00',
    TUE: '08:00',
    WED: '08:00',
    THU: '08:00',
    FRI: '08:00',
    SAT: '08:00',
    SUN: '08:00',
  },
}

export default function RemindersScreen() {
  const router = useRouter()
  const { accessToken } = useSession()
  const theme = useTheme()

  const [visible, setVisible] = useState(false)
  const [snackbarText, setSnackbarText] = useState('')

  const [reminders, setReminders] = useState<RemindersState>(DEFAULT_REMINDERS)
  const [activePicker, setActivePicker] = useState<{ type: ReminderType; day: DayKey } | null>(null)
  const [infoModalVisible, setInfoModalVisible] = useState(false)

  const dismissSnackbar = () => setVisible(false)

  let uid = ''
  let isAdmin = false
  if (accessToken != null && accessToken !== undefined) {
    try {
      const decoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
      uid = decoded['uid'] || ''
      isAdmin = !!decoded['admin']
    } catch {
      uid = ''
      isAdmin = false
    }
  }

  useEffect(() => {
    if (!uid) return
    const loadReminderTimes = async () => {
      // 1. Load local cache
      try {
        const cached = await AsyncStorage.getItem(`user_reminders_${uid}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed && parsed.QUESTIONNAIRE && parsed.SENSOR) {
            setReminders(parsed)
          }
        }
      } catch (e) {
        console.error('Failed to load local reminder times:', e)
      }

      // 2. Sync with API
      try {
        const res = await api.get('/reminders')
        if (res.status === 200 && res.data) {
          const apiReminders: RemindersState = {
            QUESTIONNAIRE: { ...DEFAULT_REMINDERS.QUESTIONNAIRE, ...(res.data.QUESTIONNAIRE || {}) },
            SENSOR: { ...DEFAULT_REMINDERS.SENSOR, ...(res.data.SENSOR || {}) },
          }
          setReminders(apiReminders)
          await AsyncStorage.setItem(`user_reminders_${uid}`, JSON.stringify(apiReminders))
        }
      } catch (e) {
        console.warn('Could not sync reminders from API:', e)
      }
    }
    loadReminderTimes()
  }, [uid])

  const saveRemindersToApi = async (newReminders: RemindersState) => {
    try {
      await AsyncStorage.setItem(`user_reminders_${uid}`, JSON.stringify(newReminders))
      const res = await api.put('/reminders', newReminders)
      if (res.status === 200) {
        setSnackbarText('Heures de rappel mises à jour !')
      } else {
        setSnackbarText('Enregistré en local.')
      }
      setVisible(true)
    } catch (e) {
      console.error('Failed to sync reminder times to API:', e)
      setSnackbarText('Enregistré en local (hors-ligne).')
      setVisible(true)
    }
  }

  const handleConfirmTime = ({ hours, minutes }: { hours: number; minutes: number }) => {
    if (!activePicker) return

    if (!isAdmin && (hours < 5 || hours > 13 || (hours === 13 && minutes > 0))) {
      setActivePicker(null)
      setSnackbarText("L'heure de rappel doit être comprise entre 05h00 et 13h00.")
      setVisible(true)
      return
    }

    const { type, day } = activePicker
    setActivePicker(null)

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    const updated: RemindersState = {
      ...reminders,
      [type]: {
        ...reminders[type],
        [day]: formattedTime,
      },
    }

    setReminders(updated)
    saveRemindersToApi(updated)
  }

  const currentPickerTime = activePicker ? reminders[activePicker.type][activePicker.day] || '08:00' : '08:00'
  const pickerHours = parseInt(currentPickerTime.split(':')[0], 10) || 8
  const pickerMinutes = parseInt(currentPickerTime.split(':')[1], 10) || 0

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView keyboardShouldPersistTaps="always">
        <Appbar.Header statusBarHeight={0}>
          <Appbar.BackAction onPress={() => { router.back() }} />
          <Appbar.Content title="Mes rappels" />
          <Appbar.Action icon="information-outline" onPress={() => setInfoModalVisible(true)} />
        </Appbar.Header>

        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Rappels questionnaire</List.Subheader>
          {DAYS.map((d) => (
            <List.Item
              key={`q_${d.key}`}
              title={d.label}
              right={() => (
                <Button
                  mode="outlined"
                  onPress={() => setActivePicker({ type: 'QUESTIONNAIRE', day: d.key })}
                  style={styles.timeButton}
                >
                  {reminders.QUESTIONNAIRE[d.key] || '08:00'}
                </Button>
              )}
              left={(props) => <List.Icon {...props} icon="calendar-clock" />}
            />
          ))}
        </List.Section>

        <Divider style={{ marginVertical: 8 }} />

        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Rappels port du capteur</List.Subheader>
          {DAYS.map((d) => (
            <List.Item
              key={`s_${d.key}`}
              title={d.label}
              right={() => (
                <Button
                  mode="outlined"
                  onPress={() => setActivePicker({ type: 'SENSOR', day: d.key })}
                  style={styles.timeButton}
                >
                  {reminders.SENSOR[d.key] || '08:00'}
                </Button>
              )}
              left={(props) => <List.Icon {...props} icon="watch-variant" />}
            />
          ))}
        </List.Section>
      </ScrollView>

      {activePicker && (
        <TimePickerModal
          visible={!!activePicker}
          onDismiss={() => setActivePicker(null)}
          onConfirm={handleConfirmTime}
          hours={pickerHours}
          minutes={pickerMinutes}
          use24HourClock
          locale="fr"
          label={`Rappel ${activePicker.type === 'QUESTIONNAIRE' ? 'questionnaire' : 'capteur'} (${DAYS.find(d => d.key === activePicker.day)?.label})`}
          cancelLabel="Annuler"
          confirmLabel="Valider"
        />
      )}

      <Snackbar
        visible={visible}
        duration={5000}
        onDismiss={dismissSnackbar}>
        {snackbarText}
      </Snackbar>

      <Portal>
        <Dialog visible={infoModalVisible} onDismiss={() => setInfoModalVisible(false)}>
          <Dialog.Title style={{ textAlign: 'center' }}>Informations</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 24, maxHeight: 400 }}>
            <ScrollView contentContainerStyle={{ paddingVertical: 8, gap: 12 }}>
              <Text variant="bodyMedium">
                Cette page vous permet de personnaliser l'horaire de vos notifications quotidiennes :
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Rappels questionnaire</Text> : Choisissez l'heure à laquelle recevoir la notification pour remplir le questionnaire chaque jour de la semaine.
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Rappels port du capteur</Text> : Choisissez l'heure de rappel pour penser à porter votre capteur d'activité.
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Plage horaire autorisée</Text> : Les heures de rappel doivent être programmées entre <Text style={{ fontWeight: 'bold' }}>05h00 et 13h00</Text>.
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Sauvegarde</Text> : Vos modifications sont enregistrées en local et automatiquement synchronisées avec le serveur.
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setInfoModalVisible(false)}>Compris</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  sectionHeader: { fontWeight: 'bold' },
  timeButton: { alignSelf: 'center', marginRight: 16 },
})
