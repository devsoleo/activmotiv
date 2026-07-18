import React, { useState } from 'react'
import { StyleSheet, View, Image, Dimensions, ScrollView } from 'react-native'
import { Text, Button, Card, IconButton, useTheme } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getNetworkStateAsync } from 'expo-network'
import { Buffer } from 'buffer'
import { useSession } from '@/contexts/auth'
import { api } from '@/services/api'
import { illustrationsList, valenceList, arousalList, valenceDarkList, arousalDarkList, apExerciceImages, apLoisirsImages, apTransportsActifsImages, usAccomplissementImages, usAnimauxImages, usNatureImages, usPlaisirImages, usRelationSocialeImages } from '@/constants/images'
import ImageSelection from './components/ImageSelection'
import SAM from './components/SAM'

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
  const apImages = [...apExerciceImages, ...apLoisirsImages, ...apTransportsActifsImages]
  const posImages = [...usAccomplissementImages, ...usAnimauxImages, ...usNatureImages, ...usPlaisirImages, ...usRelationSocialeImages]

  const targetAPCount = Math.min(apImages.length, 15)
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
  const [timeType, setTimeType] = useState<'week' | 'weekend'>('week')
  const [weekHour, setWeekHour] = useState(18)
  const [weekMinute, setWeekMinute] = useState(0)
  const [weekendHour, setWeekendHour] = useState(10)
  const [weekendMinute, setWeekendMinute] = useState(0)

  const totalSteps = 5
  const screenWidth = Dimensions.get('window').width
  const isLastStep = step === totalSteps - 1

  const handleNext = async () => {
    if (isLastStep) {
      if (!accessToken) {
        router.replace('/(auth)/login')
        return
      }
      try {
        const decoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
        const uid = decoded["uid"]
        
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

        // 2. Format weekday and weekend times
        const formattedWeekTime = `${String(weekHour).padStart(2, '0')}:${String(weekMinute).padStart(2, '0')}`
        const formattedWeekendTime = `${String(weekendHour).padStart(2, '0')}:${String(weekendMinute).padStart(2, '0')}`
        
        // 3. Save onboarding completed and preferred times
        await AsyncStorage.setItem(`onboarded_${uid}`, 'true')
        await AsyncStorage.setItem(`questionnaire_hour_week_${uid}`, formattedWeekTime)
        await AsyncStorage.setItem(`questionnaire_hour_weekend_${uid}`, formattedWeekendTime)
        // Also save a fallback compatible standard questionnaire_hour
        await AsyncStorage.setItem(`questionnaire_hour_${uid}`, formattedWeekTime)
        
        router.replace('/(tabs)')
      } catch (e) {
        console.error("Failed to complete onboarding:", e)
        router.replace('/(tabs)')
      }
    } else {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1)
      // Reset evaluation index when going back to make sure it doesn't overflow if images count changed
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
        if (prev.length >= targetAPCount) return prev
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

  // Verification if all selected images are fully rated
  const isAllImagesEvaluated = () => {
    return selectedImages.every(globalIndex => {
      const r = ratings[globalIndex]
      return r && r.valence !== null && r.arousal !== null
    })
  }

  const isNextDisabled = () => {
    if (step === 1 && selectedAPImages.length !== targetAPCount) {
      return true
    }
    if (step === 2 && selectedPOSImages.length !== targetPOSCount) {
      return true
    }
    if (step === 3 && !isAllImagesEvaluated()) {
      return true
    }
    return false
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.outlineVariant }]}>
        <View style={styles.headerCenter}>
          <Text variant="labelLarge" style={styles.stepIndicatorText}>
            {`Étape ${step + 1} sur ${totalSteps}`}
          </Text>
          <View style={styles.progressContainer}>
            {[...Array(totalSteps)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i === step ? styles.activeDot : styles.inactiveDot
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.contentBody}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <View style={styles.stepContainer}>
              <Image
                style={styles.logo}
                source={theme.dark ? require("@/assets/images/activmotiv-dark.png") : require("@/assets/images/activmotiv.png")}
              />
              <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>Bienvenue sur ActivMotiv</Text>
              
              <Card style={styles.textCard}>
                <Card.Content>
                  <Text style={[styles.introductionText, { color: theme.colors.onSurfaceVariant }]}>
                    {"ActivMotiv est un outil d'accompagnement quotidien conçu pour vous soutenir dans votre pratique d'activité physique."}
                  </Text>
                  <Text style={[styles.introductionText, { color: theme.colors.onSurfaceVariant }]}>
                    {"Grâce à cette application, vous pourrez composer une galerie d'images de motivation personnalisée, évaluer vos ressentis émotionnels au fil des jours, et remplir des questionnaires d'auto-suivi scientifique."}
                  </Text>
                  <Text style={[styles.introductionText, { color: theme.colors.onSurfaceVariant }]}>
                    {"Ce parcours de présentation en quelques étapes rapides vous permettra de configurer l'application selon vos préférences pour débuter sereinement votre suivi."}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          )}

          {step === 1 && (
            <ImageSelection
              title={"Sélectionnez vos images d'Activité Physique (AP)"}
              description={
                <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                  {"Pour personnaliser votre galerie de motivation, vous devez sélectionner "}
                  <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{`exactement ${targetAPCount} images`}</Text>
                  {" représentant une activité physique ou sportive parmi la liste ci-dessous :"}
                </Text>
              }
              categories={[
                { data: attachIndices(apExerciceImages), title: "Exercice" },
                { data: attachIndices(apLoisirsImages), title: "Loisirs" },
                { data: attachIndices(apTransportsActifsImages), title: "Transports actifs" }
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
                  {"Sélectionnez maintenant "}
                  <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{`exactement ${targetPOSCount} images`}</Text>
                  {" positives ou agréables pour compléter votre galerie de motivation parmi la liste ci-dessous :"}
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
              <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>Planifier vos Rappels</Text>
              
              <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                {"Pour garantir la régularité de votre accompagnement, l'application vous enverra de courts questionnaires périodiques."}
              </Text>
              <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                {"Sélectionnez l'heure de rappel de vos questionnaires pour la semaine et pour le week-end :"}
              </Text>

              <View style={styles.tabContainer}>
                <Button
                  mode={timeType === 'week' ? 'contained' : 'outlined'}
                  onPress={() => setTimeType('week')}
                  style={styles.tabButton}
                  labelStyle={{ fontSize: 13, fontWeight: 'bold' }}
                >
                  {"En semaine (Lun - Ven)"}
                </Button>
                <Button
                  mode={timeType === 'weekend' ? 'contained' : 'outlined'}
                  onPress={() => setTimeType('weekend')}
                  style={styles.tabButton}
                  labelStyle={{ fontSize: 13, fontWeight: 'bold' }}
                >
                  {"Le week-end (Sam - Dim)"}
                </Button>
              </View>

              <Card style={styles.timeCard}>
                <Card.Content style={{ alignItems: 'center' }}>
                  <Text variant="titleMedium" style={[styles.timeSectionTitle, { color: theme.colors.primary }]}>
                    {timeType === 'week' ? "Horaires de Semaine" : "Horaires de Week-end"}
                  </Text>

                  <View style={styles.timePickerContainer}>
                    <View style={[styles.timeColumn, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <IconButton
                        icon="chevron-up"
                        size={32}
                        iconColor={theme.colors.primary}
                        onPress={() => {
                          if (timeType === 'week') {
                            setWeekHour((prev) => (prev + 1) % 24)
                          } else {
                            setWeekendHour((prev) => (prev + 1) % 24)
                          }
                        }}
                      />
                      <Text style={[styles.timeText, { color: theme.colors.onSurface }]}>
                        {timeType === 'week' ? String(weekHour).padStart(2, '0') : String(weekendHour).padStart(2, '0')}
                      </Text>
                      <IconButton
                        icon="chevron-down"
                        size={32}
                        iconColor={theme.colors.primary}
                        onPress={() => {
                          if (timeType === 'week') {
                            setWeekHour((prev) => (prev - 1 + 24) % 24)
                          } else {
                            setWeekendHour((prev) => (prev - 1 + 24) % 24)
                          }
                        }}
                      />
                    </View>
                    
                    <Text style={[styles.timeDivider, { color: theme.colors.primary }]}>:</Text>
                    
                    <View style={[styles.timeColumn, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <IconButton
                        icon="chevron-up"
                        size={32}
                        iconColor={theme.colors.primary}
                        onPress={() => {
                          if (timeType === 'week') {
                            setWeekMinute((prev) => (prev + 5) % 60)
                          } else {
                            setWeekendMinute((prev) => (prev + 5) % 60)
                          }
                        }}
                      />
                      <Text style={[styles.timeText, { color: theme.colors.onSurface }]}>
                        {timeType === 'week' ? String(weekMinute).padStart(2, '0') : String(weekendMinute).padStart(2, '0')}
                      </Text>
                      <IconButton
                        icon="chevron-down"
                        size={32}
                        iconColor={theme.colors.primary}
                        onPress={() => {
                          if (timeType === 'week') {
                            setWeekMinute((prev) => (prev - 5 + 60) % 60)
                          } else {
                            setWeekendMinute((prev) => (prev - 5 + 60) % 60)
                          }
                        }}
                      />
                    </View>
                  </View>

                  <View style={styles.quickTimeContainer}>
                    {timeType === 'week' ? (
                      ['08:30', '12:30', '18:00', '20:00'].map((time) => {
                        const [h, m] = time.split(':').map(Number)
                        const isCurrent = weekHour === h && weekMinute === m
                        return (
                          <Button
                            key={time}
                            mode={isCurrent ? "contained" : "outlined"}
                            onPress={() => {
                              setWeekHour(h)
                              setWeekMinute(m)
                            }}
                            style={styles.quickTimeButton}
                            labelStyle={{ fontSize: 13 }}
                          >
                            {time}
                          </Button>
                        )
                      })
                    ) : (
                      ['09:00', '11:00', '15:00', '18:00'].map((time) => {
                        const [h, m] = time.split(':').map(Number)
                        const isCurrent = weekendHour === h && weekendMinute === m
                        return (
                          <Button
                            key={time}
                            mode={isCurrent ? "contained" : "outlined"}
                            onPress={() => {
                              setWeekendHour(h)
                              setWeekendMinute(m)
                            }}
                            style={styles.quickTimeButton}
                            labelStyle={{ fontSize: 13 }}
                          >
                            {time}
                          </Button>
                        )
                      })
                    )}
                  </View>
                </Card.Content>
              </Card>

              <Card style={[styles.summaryCard, { backgroundColor: theme.colors.elevation.level1, borderLeftColor: theme.colors.primary }]}>
                <Card.Content>
                  <Text variant="titleSmall" style={[styles.summaryTitle, { color: theme.colors.primary }]}>{"Résumé de vos préférences :"}</Text>
                  <View style={[styles.summaryRowItem, { borderBottomColor: theme.colors.outlineVariant }]}>
                    <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>{"En semaine (Lun-Ven) :"}</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{`${String(weekHour).padStart(2, '0')}h${String(weekMinute).padStart(2, '0')}`}</Text>
                  </View>
                  <View style={[styles.summaryRowItem, { borderBottomColor: theme.colors.outlineVariant }]}>
                    <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>{"Le week-end (Sam-Dim) :"}</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{`${String(weekendHour).padStart(2, '0')}h${String(weekendMinute).padStart(2, '0')}`}</Text>
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
    width: 12,
    height: 12,
    borderRadius: 6
  },
  activeDot: {
    backgroundColor: 'rgb(0, 99, 153)',
    width: 28
  },
  inactiveDot: {
    backgroundColor: 'rgb(194, 199, 207)'
  },
  contentBody: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20
  },
  stepContainer: {
    padding: 20,
    alignItems: 'center'
  },
  logo: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
    marginTop: 20,
    marginBottom: 30
  },
  stepTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  textCard: {
    width: '100%',
    elevation: 1,
    borderRadius: 12
  },
  introductionText: {
    textAlign: 'justify',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  descriptionText: {
    textAlign: 'justify',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    width: '100%'
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8
  },
  tabButton: {
    flex: 1,
    borderRadius: 12
  },
  timeCard: {
    width: '100%',
    elevation: 2,
    borderRadius: 12,
    padding: 10
  },
  timeSectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center'
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10
  },
  timeColumn: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 52
  },
  timeDivider: {
    fontSize: 48,
    fontWeight: 'bold',
    marginHorizontal: 15,
    bottom: 2
  },
  quickTimeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginVertical: 10
  },
  quickTimeButton: {
    borderRadius: 18,
    minWidth: '22%'
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
