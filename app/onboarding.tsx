import React, { useState } from 'react'
import { StyleSheet, View, Image, Dimensions, ScrollView, TouchableOpacity } from 'react-native'
import { Text, Button, Card, IconButton, useTheme } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getNetworkStateAsync } from 'expo-network'
import { Buffer } from 'buffer'
import { useSession } from '@/contexts/auth'
import { api } from '@/services/api'
import { illustrationsList, valenceList, arousalList } from '@/constants/images'

export default function OnboardingScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { accessToken } = useSession()
  const [step, setStep] = useState(0)

  // Separate AP (ID >= 17) and POS (ID <= 16) images
  const apImages = illustrationsList.filter(item => Number(item.id) >= 17)
  const posImages = illustrationsList.filter(item => Number(item.id) <= 16)

  const targetAPCount = Math.min(apImages.length, 20)
  const targetPOSCount = Math.min(posImages.length, 20)

  // Step 1 & 2: Choice of AP and POS images States - Pre-select exactly target count by default
  const [selectedImages, setSelectedImages] = useState<string[]>(() => {
    const apIds = apImages.slice(0, targetAPCount).map(item => item.id)
    const posIds = posImages.slice(0, targetPOSCount).map(item => item.id)
    return [...apIds, ...posIds]
  })

  const selectedAPImages = selectedImages.filter(id => Number(id) >= 17)
  const selectedPOSImages = selectedImages.filter(id => Number(id) <= 16)

  // Step 3: Évaluation des images States
  const [evaluationIndex, setEvaluationIndex] = useState(0)
  const [ratings, setRatings] = useState<Record<string, { valence: number | null, arousal: number | null }>>({})

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
        
        // 1. Save ratings for ALL illustrations to local cache and server
        const networkState = await getNetworkStateAsync()
        const isConnected = networkState.isConnected

        const finalSamCache: any[] = []

        for (const item of illustrationsList) {
          const isSelected = selectedImages.includes(item.id)
          const imageId = Number(item.id)
          const itemRating = ratings[item.id]
          
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

  const toggleImage = (id: string) => {
    const isAp = Number(id) >= 17
    setSelectedImages((prev) => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id)
      } else {
        const selectedCount = prev.filter(item => isAp ? Number(item) >= 17 : Number(item) <= 16).length
        const maxLimit = isAp ? targetAPCount : targetPOSCount
        if (selectedCount >= maxLimit) return prev
        return [...prev, id]
      }
    })
  }

  const handleRate = (variant: 'valence' | 'arousal', value: number) => {
    const currentId = selectedImages[evaluationIndex]
    setRatings((prev) => ({
      ...prev,
      [currentId]: {
        valence: prev[currentId]?.valence ?? null,
        arousal: prev[currentId]?.arousal ?? null,
        [variant]: value
      }
    }))
  }

  // Verification if all selected images are fully rated
  const isAllImagesEvaluated = () => {
    return selectedImages.every(id => {
      const r = ratings[id]
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

  // Count fully rated images
  const ratedCount = selectedImages.filter(id => {
    const r = ratings[id]
    return r && r.valence !== null && r.arousal !== null
  }).length

  // Styles for responsive SAM rating images in step 2
  const padding = 4
  const margin = 4
  const numColumns = 5
  const imageSize = (screenWidth - (padding * 2 + margin * 2 * numColumns + 48)) / numColumns

  // Grid styling for Step 1
  const gridColumns = 3
  const gridPadding = 8
  const gridMargin = 4
  const gridImageSize = (screenWidth - (gridPadding * 2 + gridMargin * 2 * gridColumns + 32)) / gridColumns

  // Current image under evaluation in Step 2
  const currentEvalId = selectedImages[evaluationIndex] || selectedImages[0]
  const currentEvalImage = illustrationsList.find(i => i.id === currentEvalId) || illustrationsList[0]
  const currentRating = ratings[currentEvalId] || { valence: null, arousal: null }

  // Check if current image has any low rating (< 4 out of 5)
  const hasLowRating = (currentRating.valence !== null && currentRating.valence < 4) || 
                       (currentRating.arousal !== null && currentRating.arousal < 4)

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
                source={require("@/assets/images/activmotiv.png")}
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
            <View style={styles.stepContainer}>
              <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>{"Sélectionnez vos Images d'Activité Physique (AP)"}</Text>
              
              <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                {"Pour personnaliser votre galerie de motivation, vous devez sélectionner "}
                <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{`exactement ${targetAPCount} images`}</Text>
                {" représentant une activité physique ou sportive parmi la liste ci-dessous :"}
              </Text>

              <View style={[
                styles.counterBadge,
                selectedAPImages.length === targetAPCount ? styles.counterBadgeSuccess : styles.counterBadgeWarning
              ]}>
                <Text style={[
                  styles.counterText,
                  selectedAPImages.length === targetAPCount ? styles.counterTextSuccess : styles.counterTextWarning
                ]}>
                  {selectedAPImages.length === targetAPCount 
                    ? `✓ Sélection AP prête : ${targetAPCount} images sélectionnées` 
                    : `Sélectionnez vos images AP (${selectedAPImages.length} / ${targetAPCount})`
                  }
                </Text>
              </View>

              <View style={styles.gridContainer}>
                {apImages.map((item) => {
                  const isSelected = selectedImages.includes(item.id)
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggleImage(item.id)}
                      style={[
                        styles.gridImageItem,
                        { width: gridImageSize, height: gridImageSize, margin: gridMargin, backgroundColor: theme.colors.surfaceVariant }
                      ]}
                    >
                      <Image
                        source={item.source}
                        style={[
                          styles.gridImage,
                          !isSelected && styles.gridImageDeselected
                        ]}
                      />
                      {isSelected && (
                        <View style={[styles.gridImageCheckWrapper, { backgroundColor: theme.colors.surface }]}>
                          <IconButton
                            icon="check-circle"
                            iconColor={theme.colors.primary}
                            size={24}
                            style={styles.gridCheckIcon}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>{"Sélectionnez vos Images Positives (POS)"}</Text>
              
              <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                {"Sélectionnez maintenant "}
                <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{`exactement ${targetPOSCount} images`}</Text>
                {" positives ou agréables pour compléter votre galerie de motivation parmi la liste ci-dessous :"}
              </Text>

              <View style={[
                styles.counterBadge,
                selectedPOSImages.length === targetPOSCount ? styles.counterBadgeSuccess : styles.counterBadgeWarning
              ]}>
                <Text style={[
                  styles.counterText,
                  selectedPOSImages.length === targetPOSCount ? styles.counterTextSuccess : styles.counterTextWarning
                ]}>
                  {selectedPOSImages.length === targetPOSCount 
                    ? `✓ Sélection POS prête : ${targetPOSCount} images sélectionnées` 
                    : `Sélectionnez vos images POS (${selectedPOSImages.length} / ${targetPOSCount})`
                  }
                </Text>
              </View>

              <View style={styles.gridContainer}>
                {posImages.map((item) => {
                  const isSelected = selectedImages.includes(item.id)
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggleImage(item.id)}
                      style={[
                        styles.gridImageItem,
                        { width: gridImageSize, height: gridImageSize, margin: gridMargin, backgroundColor: theme.colors.surfaceVariant }
                      ]}
                    >
                      <Image
                        source={item.source}
                        style={[
                          styles.gridImage,
                          !isSelected && styles.gridImageDeselected
                        ]}
                      />
                      {isSelected && (
                        <View style={[styles.gridImageCheckWrapper, { backgroundColor: theme.colors.surface }]}>
                          <IconButton
                            icon="check-circle"
                            iconColor={theme.colors.primary}
                            size={24}
                            style={styles.gridCheckIcon}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>{"Évaluez vos Images"}</Text>
              
              <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                {"Pour chaque image sélectionnée, veuillez indiquer à quel point elle vous stimule et à quel point elle vous est agréable en sélectionnant le personnage SAM correspondant :"}
              </Text>

              <View style={[
                styles.counterBadge,
                ratedCount === selectedImages.length ? styles.counterBadgeSuccess : styles.counterBadgeWarning
              ]}>
                <Text style={[
                  styles.counterText,
                  ratedCount === selectedImages.length ? styles.counterTextSuccess : styles.counterTextWarning
                ]}>
                  {ratedCount === selectedImages.length 
                    ? `✓ Évaluation terminée : ${selectedImages.length} / ${selectedImages.length} images évaluées` 
                    : `Évaluez toutes les images (${ratedCount} / ${selectedImages.length} évaluées)`
                  }
                </Text>
              </View>

              <Card style={styles.evalCard}>
                <Card.Content style={{ alignItems: 'center' }}>
                  <Text variant="titleMedium" style={[styles.evalProgressIndicator, { color: theme.colors.primary }]}>
                    {`Image ${evaluationIndex + 1} sur ${selectedImages.length}`}
                  </Text>

                  <View style={styles.evalImageContainer}>
                    <Image
                      source={currentEvalImage.source}
                      style={styles.evalMainImage}
                    />
                  </View>

                  {/* Valence (Emotion) Scale */}
                  <Text variant="bodyMedium" style={[styles.samLabel, { marginTop: 14, color: theme.colors.onSurface }]}>
                    {"Quand je regarde cette image, je me sens..."}
                  </Text>
                  <View style={styles.samRow}>
                    {valenceList.map((item) => {
                      const isSelected = currentRating.valence === Number(item.id)
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => handleRate('valence', Number(item.id))}
                          style={[styles.samButton, isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }]}
                        >
                          <Image
                            source={item.source}
                            style={{ width: imageSize, height: imageSize, resizeMode: 'contain' }}
                          />
                        </TouchableOpacity>
                      )
                    })}
                  </View>

                  {/* Arousal (Activation) Scale */}
                  <Text variant="bodyMedium" style={[styles.samLabel, { color: theme.colors.onSurface }]}>
                    {"Quand je regarde cette image, je la trouve..."}
                  </Text>
                  <View style={styles.samRow}>
                    {arousalList.map((item) => {
                      const isSelected = currentRating.arousal === Number(item.id)
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => handleRate('arousal', Number(item.id))}
                          style={[styles.samButton, isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }]}
                        >
                          <Image
                            source={item.source}
                            style={{ width: imageSize, height: imageSize, resizeMode: 'contain' }}
                          />
                        </TouchableOpacity>
                      )
                    })}
                  </View>

                  {/* Informative message for rating < 4 */}
                  {hasLowRating && (
                    <Card style={styles.warningCard}>
                      <Card.Content>
                        <Text style={styles.warningText}>
                          {"💡 Conseil de cohérence : Comme vous avez sélectionné cette image vous-même pour votre galerie de motivation, lui donner une note faible (< 4 sur 5) peut sembler contradictoire. Si cette image ne vous inspire pas de ressentis positifs, vous pouvez retourner aux étapes précédentes pour la remplacer par une autre, ou modifier votre évaluation si votre doigt a glissé ! (Cette alerte n'est pas bloquante)."}
                        </Text>
                      </Card.Content>
                    </Card>
                  )}

                  {/* Navigation Chevrons Row */}
                  <View style={styles.evalActionsRow}>
                    <IconButton
                      icon="chevron-left"
                      size={36}
                      disabled={evaluationIndex <= 0}
                      iconColor={theme.colors.primary}
                      onPress={() => setEvaluationIndex((prev) => prev - 1)}
                    />
                    <IconButton
                      icon="chevron-right"
                      size={36}
                      disabled={evaluationIndex >= selectedImages.length - 1 || currentRating.valence === null || currentRating.arousal === null}
                      iconColor={theme.colors.primary}
                      onPress={() => setEvaluationIndex((prev) => prev + 1)}
                    />
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>Planifier vos Rappels</Text>
              
              <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                {"Pour garantir la régularité de votre accompagnement, l'application vous enverra de courts questionnaires périodiques (F-SUS et Générique)."}
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
  counterBadge: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 16,
    alignSelf: 'center',
    borderWidth: 1
  },
  counterBadgeWarning: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba'
  },
  counterBadgeSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb'
  },
  counterText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center'
  },
  counterTextWarning: {
    color: '#856404'
  },
  counterTextSuccess: {
    color: '#155724'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16
  },
  gridImageItem: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  gridImageDeselected: {
    opacity: 0.4
  },
  gridImageCheckWrapper: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    borderRadius: 16
  },
  gridCheckIcon: {
    margin: 0,
    padding: 0
  },
  evalCard: {
    width: '100%',
    elevation: 2,
    borderRadius: 12,
    paddingVertical: 12
  },
  evalProgressIndicator: {
    fontWeight: 'bold',
    marginBottom: 12
  },
  evalImageContainer: {
    width: '80%',
    aspectRatio: 16 / 9,
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  evalMainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  samLabel: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 6
  },
  samRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10
  },
  samButton: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    padding: 2
  },
  samSelectedButton: {
  },
  warningCard: {
    marginHorizontal: 12,
    marginTop: 16,
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 10
  },
  warningText: {
    color: '#856404',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'justify'
  },
  evalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    gap: 40
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
