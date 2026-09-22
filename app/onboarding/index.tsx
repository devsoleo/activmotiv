import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Dimensions, ScrollView } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { Text, Button, Card, IconButton, useTheme, List, Divider, Snackbar } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getNetworkStateAsync } from 'expo-network'
import { Buffer } from 'buffer'
import { useSession } from '@/contexts/auth'
import { api } from '@/services/api'
import { TimePickerModal, registerTranslation, fr } from 'react-native-paper-dates'
import { illustrationsList, valenceList, arousalList, valenceDarkList, arousalDarkList, apExerciceImages, apLoisirsImages, apTransportsActifsImages, usAccomplissementImages, usAnimauxImages, usNatureImages, usPlaisirImages, usRelationSocialeImages } from '@/constants/images'
import ImageSelection from './components/ImageSelection'
import SAM from './components/SAM'

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

export default function OnboardingScreen() {
  const theme = useTheme()
  const activeValenceList = theme.dark ? valenceDarkList : valenceList
  const activeArousalList = theme.dark ? arousalDarkList : arousalList
  const router = useRouter()
  const { accessToken } = useSession()
  const [step, setStep] = useState(0)

  // Attach global index (position in illustrationsList) to category items
  const attachIndices = (list: { source: any }[]) => {
    return list.map((item) => ({
      ...item,
      globalIndex: illustrationsList.indexOf(item),
    }))
  }

  // Separate AP and POS images from individual arrays
  const apExerciceCategories = attachIndices(apExerciceImages)
  const apLoisirsCategories = attachIndices(apLoisirsImages)
  const apTransportsActifsCategories = attachIndices(apTransportsActifsImages)

  const apExerciceIndices = apExerciceCategories.map((item) => item.globalIndex)
  const apLoisirsIndices = apLoisirsCategories.map((item) => item.globalIndex)
  const apTransportsActifsIndices = apTransportsActifsCategories.map((item) => item.globalIndex)

  const posImages = [...usAccomplissementImages, ...usAnimauxImages, ...usNatureImages, ...usPlaisirImages, ...usRelationSocialeImages]

  const targetAPCount = 15
  const targetPOSCount = Math.min(posImages.length, 15)

  // Step 1 & 2: Choice of AP and POS images stored as global indices (numbers)
  const [selectedAPImages, setSelectedAPImages] = useState<number[]>([])
  const [selectedPOSImages, setSelectedPOSImages] = useState<number[]>([])

  // Concatenated list of selected global indices passed to Step 3 (SAM) and save handler
  const selectedImages = [...selectedAPImages, ...selectedPOSImages]

  // Step 3: Évaluation des images States (keyed by globalIndex)
  const [evaluationIndex, setEvaluationIndex] = useState(0)
  const [ratings, setRatings] = useState<Record<number, { valence: number | null, arousal: number | null }>>({})

  // Step 4: Time Config States
  const [reminders, setReminders] = useState<RemindersState>(DEFAULT_REMINDERS)
  const [activePicker, setActivePicker] = useState<{ type: ReminderType; day: DayKey } | null>(null)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarText, setSnackbarText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 5
  const screenWidth = Dimensions.get('window').width
  const isLastStep = step === totalSteps - 1

  useEffect(() => {
    const uris = illustrationsList.map((item) => item.source?.uri).filter((uri): uri is string => Boolean(uri))
    if (uris.length > 0) {
      ExpoImage.prefetch(uris)
    }
  }, [])

  useEffect(() => {
    if (!accessToken) return
    const loadSavedReminders = async () => {
      try {
        const decoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
        const uid = decoded['uid']
        if (!uid) return

        const cached = await AsyncStorage.getItem(`user_reminders_${uid}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed && parsed.QUESTIONNAIRE && parsed.SENSOR) {
            setReminders(parsed)
          }
        }

        const res = await api.get('/reminders')
        if (res.status === 200 && res.data) {
          const apiReminders: RemindersState = {
            QUESTIONNAIRE: { ...DEFAULT_REMINDERS.QUESTIONNAIRE, ...(res.data.QUESTIONNAIRE || {}) },
            SENSOR: { ...DEFAULT_REMINDERS.SENSOR, ...(res.data.SENSOR || {}) },
          }
          setReminders(apiReminders)
        }
      } catch (e) {
        console.warn('Could not load existing reminders in onboarding:', e)
      }
    }
    loadSavedReminders()
  }, [accessToken])

  const handleConfirmTime = ({ hours, minutes }: { hours: number; minutes: number }) => {
    if (!activePicker) return

    let isAdmin = false
    if (accessToken) {
      try {
        isAdmin = !!JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())['admin']
      } catch {}
    }

    if (!isAdmin && (hours < 5 || hours > 13 || (hours === 13 && minutes > 0))) {
      setActivePicker(null)
      setSnackbarText("L'heure de rappel doit être comprise entre 05h00 et 13h00.")
      setSnackbarVisible(true)
      return
    }

    const { type, day } = activePicker
    setActivePicker(null)

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    setReminders((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [day]: formattedTime,
      },
    }))
  }

  const handleNext = async () => {
    if (isLastStep) {
      if (!accessToken) {
        router.replace('/(auth)/login')
        return
      }
      setIsSubmitting(true)
      try {
        const decoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
        const uid = decoded['uid']

        // 1. Build rating data for ALL illustrations using 1-based index (i + 1)
        const finalSamCache = illustrationsList.map((_, i) => {
          const isSelected = selectedImages.includes(i)
          const imageId = i + 1
          const itemRating = ratings[i]

          return {
            image: imageId,
            valence: isSelected ? (itemRating?.valence ?? 3) : null,
            arousal: isSelected ? (itemRating?.arousal ?? 3) : null,
            hidden: !isSelected,
          }
        })

        // Write SAM gallery state and onboarding progress to local cache
        await AsyncStorage.setItem('cache_sam', JSON.stringify(finalSamCache))
        await AsyncStorage.setItem(`onboarded_${uid}`, 'true')
        await AsyncStorage.setItem(`user_reminders_${uid}`, JSON.stringify(reminders))

        // Save to server in batch if connected
        const networkState = await getNetworkStateAsync()
        if (networkState.isConnected) {
          await Promise.all([
            api.put('/sam/batch', { items: finalSamCache }),
            api.put('/reminders', reminders),
          ]).catch((err) => {
            console.error('Failed to sync onboarding data with server:', err)
          })
        }

        router.replace('/(tabs)')
      } catch (e) {
        console.error('Failed to complete onboarding:', e)
        router.replace('/(tabs)')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1)
      if (step === 3) {
        setEvaluationIndex(0)
      }
    }
  }

  const toggleAPImage = (globalIndex: number) => {
    setSelectedAPImages((prev) => {
      if (prev.includes(globalIndex)) {
        return prev.filter(i => i !== globalIndex)
      } else {
        if (apExerciceIndices.includes(globalIndex)) {
          const count = prev.filter(i => apExerciceIndices.includes(i)).length
          if (count >= 5) return prev
        } else if (apLoisirsIndices.includes(globalIndex)) {
          const count = prev.filter(i => apLoisirsIndices.includes(i)).length
          if (count >= 5) return prev
        } else if (apTransportsActifsIndices.includes(globalIndex)) {
          const count = prev.filter(i => apTransportsActifsIndices.includes(i)).length
          if (count >= 5) return prev
        }
        return [...prev, globalIndex]
      }
    })
  }

  const togglePOSImage = (globalIndex: number) => {
    setSelectedPOSImages((prev) => {
      if (prev.includes(globalIndex)) {
        return prev.filter(i => i !== globalIndex)
      } else {
        if (prev.length >= targetPOSCount) return prev
        return [...prev, globalIndex]
      }
    })
  }

  const handleRate = (variant: 'valence' | 'arousal', value: number) => {
    const currentGlobalIndex = selectedImages[evaluationIndex]
    setRatings((prev) => ({
      ...prev,
      [currentGlobalIndex]: {
        valence: prev[currentGlobalIndex]?.valence ?? null,
        arousal: prev[currentGlobalIndex]?.arousal ?? null,
        [variant]: value
      }
    }))
  }

  const isNextDisabled = () => {
    if (isSubmitting) return true
    if (step === 0) return false
    if (step === 1) return selectedAPImages.length !== targetAPCount
    if (step === 2) return selectedPOSImages.length !== targetPOSCount
    if (step === 3) return selectedImages.some(index => !ratings[index] || ratings[index].valence === null || ratings[index].arousal === null)
    return false
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}>
        <View style={styles.headerCenter}>
          <Text variant="titleMedium" style={styles.stepIndicatorText}>
            {step === 0 ? "Bienvenue" : `Étape ${step} sur ${totalSteps - 1}`}
          </Text>
          <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  { backgroundColor: theme.colors.outlineVariant },
                  step === i && [styles.progressDotActive, { backgroundColor: theme.colors.primary }]
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {step === 0 && (
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
            </View>
          )}

          {step === 1 && (
            <ImageSelection
              title={"Sélectionnez vos images d'Activité Physique (AP)"}
              description={
                <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                  {"Pour chacune des catégories proposées, choisissez 5 images qui vous paraissent les plus appropriées pour constituer un ensemble représentatif de la catégorie (5 par catégories, soit 15 au total) : "}
                </Text>
              }
              categories={[
                { data: apExerciceCategories, title: "Exercice", targetCount: 5 },
                { data: apLoisirsCategories, title: "Loisirs", targetCount: 5 },
                { data: apTransportsActifsCategories, title: "Transports actifs", targetCount: 5 }
              ]}
              selectedImages={selectedAPImages}
              toggleImage={toggleAPImage}
              targetCount={targetAPCount}
              selectedCount={selectedAPImages.length}
              theme={theme}
              screenWidth={screenWidth}
            />
          )}

          {step === 2 && (
            <ImageSelection
              title={"Sélectionnez vos images Positives (POS)"}
              description={
                <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                  {"Parmi toutes ces images, sélectionnez les images les plus plaisantes."}
                </Text>
              }
              categories={[
                { data: attachIndices(usAccomplissementImages), title: "Accomplissement" },
                { data: attachIndices(usAnimauxImages), title: "Animaux" },
                { data: attachIndices(usNatureImages), title: "Nature" },
                { data: attachIndices(usPlaisirImages), title: "Plaisir" },
                { data: attachIndices(usRelationSocialeImages), title: "Relation sociale" }
              ]}
              selectedImages={selectedPOSImages}
              toggleImage={togglePOSImage}
              targetCount={targetPOSCount}
              selectedCount={selectedPOSImages.length}
              theme={theme}
              screenWidth={screenWidth}
            />
          )}

          {step === 3 && (
            <SAM
              selectedImages={selectedImages}
              selectedAPImages={selectedAPImages}
              evaluationIndex={evaluationIndex}
              setEvaluationIndex={setEvaluationIndex}
              ratings={ratings}
              handleRate={handleRate}
              activeValenceList={activeValenceList}
              activeArousalList={activeArousalList}
              illustrationsList={illustrationsList}
              theme={theme}
              screenWidth={screenWidth}
            />
          )}

          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>
                Planifiez vos rappels matinaux
              </Text>

              <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                {"Les rappels doivent être compris entre 5 heures et 13 heures.\n\nRassurez-vous, si vos disponibilités changent, vous pourrez modifier vos horaires à tout moment dans l’onglet « Paramètres > Mes rappels » de l’application."}
              </Text>

              <Card style={styles.timeCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.timeSectionTitle, { color: theme.colors.primary, marginBottom: 8 }]}>
                    Rappels matinaux questionnaire
                  </Text>
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
                </Card.Content>
              </Card>

              <Card style={[styles.timeCard, { marginTop: 12 }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.timeSectionTitle, { color: theme.colors.primary, marginBottom: 8 }]}>
                    Rappel port du capteur
                  </Text>
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
                </Card.Content>
              </Card>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={[styles.navigationFooter, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.outlineVariant }]}>
        <View style={styles.footerLeft}>
          {step > 0 && (
            <Button mode="outlined" onPress={handleBack} disabled={isSubmitting} style={styles.navButton}>
              Retour
            </Button>
          )}
        </View>
        <View style={styles.footerRight}>
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={isNextDisabled()}
            loading={isSubmitting}
            style={styles.navButton}
          >
            {isLastStep ? "Commencer" : "Suivant"}
          </Button>
        </View>
      </View>

      {activePicker && (
        <TimePickerModal
          visible={!!activePicker}
          onDismiss={() => setActivePicker(null)}
          onConfirm={handleConfirmTime}
          hours={parseInt((reminders[activePicker.type][activePicker.day] || '08:00').split(':')[0], 10) || 8}
          minutes={parseInt((reminders[activePicker.type][activePicker.day] || '08:00').split(':')[1], 10) || 0}
          use24HourClock
          locale="fr"
          label={`Rappel ${activePicker.type === 'QUESTIONNAIRE' ? 'questionnaire' : 'capteur'} (${DAYS.find(d => d.key === activePicker.day)?.label})`}
          cancelLabel="Annuler"
          confirmLabel="Valider"
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        duration={4000}
        onDismiss={() => setSnackbarVisible(false)}>
        {snackbarText}
      </Snackbar>
    </SafeAreaView>
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
  }
})
