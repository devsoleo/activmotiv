import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { Text, IconButton } from 'react-native-paper'
import { Image } from 'expo-image'

interface Category {
  data: { source: any; globalIndex: number }[]
  title: string
}

interface ImageSelectionProps {
  title: string
  description: any
  categories: Category[]
  selectedImages: number[]
  toggleImage: (globalIndex: number) => void
  targetCount: number
  selectedCount: number
  theme: any
  screenWidth: number
}

export default function ImageSelection({
  title,
  description,
  categories,
  selectedImages,
  toggleImage,
  targetCount,
  selectedCount,
  theme,
  screenWidth
}: ImageSelectionProps) {
  // Styles for responsive selection grid
  const gridColumns = 3
  const gridPadding = 8
  const gridMargin = 4
  const gridImageSize = (screenWidth - (gridPadding * 2 + gridMargin * 2 * gridColumns + 32)) / gridColumns

  const isTargetMet = selectedCount === targetCount

  const counterLabel = (isTargetMet ? `Sélection prête : ${targetCount} images sélectionnées` : `Sélectionnez vos images (${selectedCount} / ${targetCount})`)

  return (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.primary }]}>
        {title}
      </Text>
      
      {description}

      <View style={[
        styles.counterBadge,
        isTargetMet ? styles.counterBadgeSuccess : styles.counterBadgeWarning
      ]}>
        <Text style={[
          styles.counterText,
          isTargetMet ? styles.counterTextSuccess : styles.counterTextWarning
        ]}>
          {counterLabel}
        </Text>
      </View>

      {categories.map((cat) => {
        if (!cat.data || cat.data.length === 0) return null
        return (
          <View key={cat.title} style={{ marginTop: 16, width: '100%' }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8 }}>
              {cat.title}
            </Text>
            <View style={styles.gridContainer}>
              {cat.data.map((item) => {
                const isSelected = selectedImages.includes(item.globalIndex)
                return (
                  <TouchableOpacity
                    key={item.globalIndex}
                    onPress={() => toggleImage(item.globalIndex)}
                    activeOpacity={0.7}
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
                      contentFit="cover"
                      transition={150}
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
        )
      })}
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
  },
  gridImageDeselected: {
    opacity: 0.5
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
  }
})
