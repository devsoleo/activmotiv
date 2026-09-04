import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { Text, Card, IconButton } from 'react-native-paper'
import { Image } from 'expo-image'

interface ImageItem {
  source: any
}

interface SAMProps {
  selectedImages: number[]
  selectedAPImages?: number[]
  evaluationIndex: number
  setEvaluationIndex: React.Dispatch<React.SetStateAction<number>>
  ratings: Record<number, { valence: number | null; arousal: number | null }>
  handleRate: (variant: 'valence' | 'arousal', value: number) => void
  activeValenceList: ImageItem[]
  activeArousalList: ImageItem[]
  illustrationsList: ImageItem[]
  theme: any
  screenWidth: number
}

export default function SAM({
  selectedImages,
  selectedAPImages,
  evaluationIndex,
  setEvaluationIndex,
  ratings,
  handleRate,
  activeValenceList,
  activeArousalList,
  illustrationsList,
  theme,
  screenWidth
}: SAMProps) {
  // Count fully rated images
  const ratedCount = selectedImages.filter(globalIdx => {
    const r = ratings[globalIdx]
    return r && r.valence !== null && r.arousal !== null
  }).length

  // Styles for responsive SAM rating images
  const padding = 4
  const margin = 4
  const numColumns = 5
  const imageSize = (screenWidth - (padding * 2 + margin * 2 * numColumns + 48)) / numColumns

  // Current global index of the image under evaluation
  const currentGlobalIndex = selectedImages[evaluationIndex] ?? selectedImages[0]
  const currentEvalImage = illustrationsList[currentGlobalIndex] || illustrationsList[0]
  const currentRating = ratings[currentGlobalIndex] || { valence: null, arousal: null }

  // Check if current image is an AP image vs POS image
  const isAPImage = selectedAPImages ? selectedAPImages.includes(currentGlobalIndex) : false

  // Warning conditions:
  // - POS: rating < 4/5 for valence
  // - AP: impression particulièrement marquée (valence !== 3)
  const showPOSWarning = !isAPImage && currentRating.valence !== null && currentRating.valence < 4
  const showAPWarning = isAPImage && currentRating.valence !== null && currentRating.valence !== 3
  const showWarning = showPOSWarning || showAPWarning

  const warningMessage = isAPImage
    ? "Vérification : Vous avez sélectionné cette image comme représentative de la catégorie. Si elle vous évoque une impression particulièrement marquée (positive ou négative), vous pouvez, si vous le souhaitez, retourner aux étapes précédentes pour choisir une autre image. (Cette alerte est simplement informative et n’empêche pas de poursuivre la sélection)."
    : "Vérification : Vous avez sélectionné cette image comme étant l'une des plus plaisantes. Votre évaluation indique que vous la trouvez peu plaisante (< 4/5). Si vous souhaitez modifier votre sélection, vous pouvez retourner aux étapes précédentes pour choisir une autre image au cas où votre doigt a glissé ! (Cette alerte est simplement informative et n’empêche pas de poursuivre la sélection)."

  const isAllEvaluated = ratedCount === selectedImages.length

  return (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>
        {"Évaluez vos Images"}
      </Text>
      
      <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
        {"Pour chaque image sélectionnée, veuillez indiquer à quel point elle vous stimule et à quel point elle vous est agréable en sélectionnant le personnage SAM correspondant :"}
      </Text>

      <View style={[
        styles.counterBadge,
        isAllEvaluated ? styles.counterBadgeSuccess : styles.counterBadgeWarning
      ]}>
        <Text style={[
          styles.counterText,
          isAllEvaluated ? styles.counterTextSuccess : styles.counterTextWarning
        ]}>
          {isAllEvaluated 
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
              contentFit="cover"
              transition={150}
              cachePolicy="disk"
            />
          </View>

          {/* Valence (Emotion) Scale */}
          <Text variant="bodyMedium" style={[styles.samLabel, { marginTop: 14, color: theme.colors.onSurface }]}>
            {"Quand je regarde cette image, je la trouve..."}
          </Text>
          <View style={styles.samLegendRow}>
            <Text variant="bodySmall" style={[styles.samLegendText, { color: theme.colors.onSurfaceVariant }]}>
              {"Très désagréable \\ négative"}
            </Text>
            <Text variant="bodySmall" style={[styles.samLegendText, { color: theme.colors.onSurfaceVariant, textAlign: 'right' }]}>
              {"Très agréable \\ positive"}
            </Text>
          </View>
          <View style={styles.samRow}>
            {activeValenceList.map((item, index) => {
              const valNum = index + 1
              const isSelected = currentRating.valence === valNum
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleRate('valence', valNum)}
                  activeOpacity={0.7}
                  style={[styles.samButton, isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }]}
                >
                  <Image
                    source={item.source}
                    style={{ width: imageSize, height: imageSize }}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Arousal (Activation) Scale */}
          <Text variant="bodyMedium" style={[styles.samLabel, { color: theme.colors.onSurface }]}>
            {"Quand je regarde cette image, je me sens..."}
          </Text>
          <View style={styles.samLegendRow}>
            <Text variant="bodySmall" style={[styles.samLegendText, { color: theme.colors.onSurfaceVariant }]}>
              {"Très calme \\ très détendu"}
            </Text>
            <Text variant="bodySmall" style={[styles.samLegendText, { color: theme.colors.onSurfaceVariant, textAlign: 'right' }]}>
              {"Surexcité \\ très stimulé"}
            </Text>
          </View>
          <View style={styles.samRow}>
            {activeArousalList.map((item, index) => {
              const valNum = index + 1
              const isSelected = currentRating.arousal === valNum
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleRate('arousal', valNum)}
                  activeOpacity={0.7}
                  style={[styles.samButton, isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }]}
                >
                  <Image
                    source={item.source}
                    style={{ width: imageSize, height: imageSize }}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Informative message */}
          {showWarning && (
            <Card style={styles.warningCard}>
              <Card.Content>
                <Text style={styles.warningText}>
                  {warningMessage}
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
  )
}

const styles = StyleSheet.create({
  stepContainer: {
    padding: 20,
    alignItems: 'center',
    width: '100%'
  },
  stepTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
    marginTop: 12,
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
    width: '70%',
    maxWidth: 240,
    aspectRatio: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  evalMainImage: {
    width: '100%',
    height: '100%',
  },
  samLabel: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 6
  },
  samLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 2,
    marginBottom: 6
  },
  samLegendText: {
    fontSize: 11,
    fontWeight: '500',
    maxWidth: '48%'
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
  }
})
