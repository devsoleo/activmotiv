import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Image, Dimensions, ScrollView } from 'react-native'
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
  const [weekHour, setWeekHour] = useState(8)
  const [weekendHour, setWeekendHour] = useState(10)
  const [sensorHour, setSensorHour] = useState(8)
  const [activePicker, setActivePicker] = useState<'week' | 'weekend' | 'sensor' | null>(null)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarText, setSnackbarText] = useState('')

  const totalSteps = 5
  const screenWidth = Dimensions.get('window').width
  const isLastStep = step === totalSteps - 1

  useEffect(() => {
    if (!accessToken) return
    const loadSavedReminders = async () => {
      try {
        const decoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
        const uid = decoded['uid']
        if (!uid) return

        const savedWeek = await AsyncStorage.getItem(`questionnaire_hour_week_${uid}`)
        if (savedWeek) {
          const h = parseInt(savedWeek.split(':')[0], 10)
          if (!isNaN(h) && h >= 5 && h <= 13) setWeekHour(h)
        }
        const savedWeekend = await AsyncStorage.getItem(`questionnaire_hour_weekend_${uid}`)
        if (savedWeekend) {
          const h = parseInt(savedWeekend.split(':')[0], 10)
          if (!isNaN(h) && h >= 5 && h <= 13) setWeekendHour(h)
        }
        const savedSensor = await AsyncStorage.getItem(`sensor_hour_${uid}`)
        if (savedSensor) {
          const h = parseInt(savedSensor.split(':')[0], 10)
          if (!isNaN(h) && h >= 5 && h <= 13) setSensorHour(h)
        }

        const res = await api.get('/reminders')
        if (res.status === 200 && res.data) {
          if (res.data.questionnaire_week) setWeekHour(Number(res.data.questionnaire_week))
          if (res.data.questionnaire_weekend) setWeekendHour(Number(res.data.questionnaire_weekend))
          if (res.data.sensor_daily) setSensorHour(Number(res.data.sensor_daily))
        }
      } catch (e) {
        console.warn('Could not load existing reminders in onboarding:', e)
      }
    }
    loadSavedReminders()
  }, [accessToken])

  const validateAndSetTime = (type: 'week' | 'weekend' | 'sensor', hours: number, minutes: number) => {
    setActivePicker(null)

    if (hours < 5 || hours > 13 || (hours === 13 && minutes > 0)) {
      setSnackbarText("L'heure de rappel doit être comprise entre 05h00 et 13h00.")
      setSnackbarVisible(true)
      return
    }

    if (type === 'week') setWeekHour(hours)
    else if (type === 'weekend') setWeekendHour(hours)
    else if (type === 'sensor') setSensorHour(hours)
  }

  const handleNext = async () => {
    if (isLastStep) {
      if (!accessToken) {
        router.replace('/(auth)/login')
        return
      }
      try {
        const decoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
        const uid = decoded['uid']

        // 1. Save ratings for ALL illustrations to local cache and server using 1-based index (i + 1)
        const networkState = await getNetworkStateAsync()
        const isConnected = networkState.isConnected

        const finalSamCache: any[] = []

        for (let i = 0; i < illustrationsList.length; i++) {
          const isSelected = selectedImages.includes(i)
          const imageId = i + 1
          const itemRating = ratings[i]

          const ratingData = {
            image: imageId,
            valence: isSelected ? (itemRating?.valence ?? 3) : null,
            arousal: isSelected ? (itemRating?.arousal ?? 3) : null,
            hidden: !isSelected // hidden is true if image is not selected
          }

          finalSamCache.push(ratingData)

          // Save to server if connected
          if (isConnected) {
            try {
              await api.put(`/sam/image/${imageId}`, {
                valence: ratingData.valence,
                arousal: ratingData.arousal,
                hidden: ratingData.hidden
              })
            } catch (err) {
              console.error(`Failed to upload rating for image ${imageId}:`, err)
            }
          }
        }

        // Write SAM gallery state to local cache
        await AsyncStorage.setItem('cache_sam', JSON.stringify(finalSamCache))

        // 2. Format weekday, weekend, and sensor times for local storage
        const formattedWeekTime = `${String(weekHour).padStart(2, '0')}:00`
        const formattedWeekendTime = `${String(weekendHour).padStart(2, '0')}:00`
        const formattedSensorTime = `${String(sensorHour).padStart(2, '0')}:00`

        // 3. Save onboarding completed and preferred times
        await AsyncStorage.setItem(`onboarded_${uid}`, 'true')
        await AsyncStorage.setItem(`questionnaire_hour_week_${uid}`, formattedWeekTime)
        await AsyncStorage.setItem(`questionnaire_hour_weekend_${uid}`, formattedWeekendTime)
        await AsyncStorage.setItem(`questionnaire_hour_${uid}`, formattedWeekTime)
        await AsyncStorage.setItem(`sensor_hour_${uid}`, formattedSensorTime)

        if (isConnected) {
          try {
            await api.put('/reminders', {
              questionnaire_week: weekHour,
              questionnaire_weekend: weekendHour,
              sensor_daily: sensorHour,
            })
          } catch (err) {
            console.error('Failed to sync reminders to API during onboarding:', err)
          }
        }

        router.replace('/(tabs)')
      } catch (e) {
        console.error('Failed to complete onboarding:', e)
        router.replace('/(tabs)')
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
                      <Text variant="titleMedium" style={styles.infoTitle}>Choix des images</Text>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {"Sélectionnez les activités physiques et images inspirantes qui vous correspondent le plus."}
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
                      <Text variant="titleMedium" style={styles.infoTitle}>Planification des rappels</Text>
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
                  {"Sélectionnez vos activités physiques (5 par catégorie, 15 au total) :"}
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
                  {`Sélectionnez ${targetPOSCount} images positives ou inspirantes :`}
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
                Planifier vos Rappels
              </Text>

              <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                {"Pour garantir la régularité de votre accompagnement, définissez vos préférences pour l'envoi des questionnaires et le rappel du port du capteur (entre 05h et 13h)."}
              </Text>

              <Card style={styles.timeCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.timeSectionTitle, { color: theme.colors.primary, marginBottom: 8 }]}>
                    Rappels matinaux questionnaire
                  </Text>

                  <List.Item
                    title="Semaine (Lundi - Vendredi)"
                    description="Entre 05h et 13h"
                    right={() => (
                      <Button mode="outlined" onPress={() => setActivePicker('week')} style={styles.timeButton}>
                        {`${String(weekHour).padStart(2, '0')}:00`}
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
                        {`${String(weekendHour).padStart(2, '0')}:00`}
                      </Button>
                    )}
                    left={(props) => <List.Icon {...props} icon="calendar-weekend" />}
                  />
                </Card.Content>
              </Card>

              <Card style={[styles.timeCard, { marginTop: 12 }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.timeSectionTitle, { color: theme.colors.primary, marginBottom: 8 }]}>
                    Rappel port du capteur
                  </Text>

                  <List.Item
                    title="Tous les matins"
                    description="Entre 05h et 13h"
                    right={() => (
                      <Button mode="outlined" onPress={() => setActivePicker('sensor')} style={styles.timeButton}>
                        {`${String(sensorHour).padStart(2, '0')}:00`}
                      </Button>
                    )}
                    left={(props) => <List.Icon {...props} icon="watch-variant" />}
                  />
                </Card.Content>
              </Card>

              <Card style={[styles.summaryCard, { backgroundColor: theme.colors.elevation.level1, borderLeftColor: theme.colors.primary, marginTop: 12 }]}>
                <Card.Content>
                  <Text variant="titleSmall" style={[styles.summaryTitle, { color: theme.colors.primary }]}>
                    {"Résumé de vos préférences :"}
                  </Text>
                  <View style={[styles.summaryRowItem, { borderBottomColor: theme.colors.outlineVariant }]}>
                    <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>{"Questionnaire semaine (Lun-Ven) :"}</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{`${String(weekHour).padStart(2, '0')}h00`}</Text>
                  </View>
                  <View style={[styles.summaryRowItem, { borderBottomColor: theme.colors.outlineVariant }]}>
                    <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>{"Questionnaire week-end (Sam-Dim) :"}</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{`${String(weekendHour).padStart(2, '0')}h00`}</Text>
                  </View>
                  <View style={styles.summaryRowItem}>
                    <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>{"Port du capteur (Tous les matins) :"}</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{`${String(sensorHour).padStart(2, '0')}h00`}</Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={[styles.navigationFooter, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.outlineVariant }]}>
        <View style={styles.footerLeft}>
          {step > 0 && (
            <Button mode="outlined" onPress={handleBack} style={styles.navButton}>
              Retour
            </Button>
          )}
        </View>
        <View style={styles.footerRight}>
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={isNextDisabled()}
            style={styles.navButton}
          >
            {isLastStep ? "Commencer" : "Suivant"}
          </Button>
        </View>
      </View>

      <TimePickerModal
        visible={activePicker === 'week'}
        onDismiss={() => setActivePicker(null)}
        onConfirm={({ hours, minutes }) => validateAndSetTime('week', hours, minutes)}
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
        onConfirm={({ hours, minutes }) => validateAndSetTime('weekend', hours, minutes)}
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
        onConfirm={({ hours, minutes }) => validateAndSetTime('sensor', hours, minutes)}
        hours={sensorHour}
        minutes={0}
        use24HourClock
        locale="fr"
        label="Rappel port du capteur"
        cancelLabel="Annuler"
        confirmLabel="Valider"
      />

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
