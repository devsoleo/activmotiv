import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, View, Linking, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { Appbar, Text, Button, Card, useTheme } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function PermissionsScreen() {
  const router = useRouter()
  const theme = useTheme()
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [scrollViewHeight, setScrollViewHeight] = useState(0)
  const [scrollContentHeight, setScrollContentHeight] = useState(0)

  const handleOpenSettings = () => {
    Linking.openSettings()
  }

  const checkIsAtBottom = (layoutH: number, contentH: number, offsetY: number) => {
    const paddingToBottom = 35
    const atBottom =
      contentH <= layoutH ||
      (layoutH > 0 && contentH > 0 && layoutH + offsetY >= contentH - paddingToBottom)
    setIsAtBottom(atBottom)
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    checkIsAtBottom(layoutMeasurement.height, contentSize.height, contentOffset.y)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header statusBarHeight={0} style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => { router.back() }} />
        <Appbar.Content title="Permissions" titleStyle={{ color: theme.colors.onBackground }} />
      </Appbar.Header>

      <View style={{ flex: 1, position: 'relative' }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: isAtBottom ? 24 : 90 }]}
          keyboardShouldPersistTaps="always"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height
            setScrollViewHeight(h)
            checkIsAtBottom(h, scrollContentHeight, 0)
          }}
          onContentSizeChange={(w, h) => {
            setScrollContentHeight(h)
            checkIsAtBottom(scrollViewHeight, h, 0)
          }}
        >
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            {"Indispensables pour l'affichage des popups"}
          </Text>
          
          <Text style={[styles.introText, { color: theme.colors.onSurfaceVariant }]}>
            {"Pour que l'ouverture automatique des images fonctionne correctement lorsque vous activez votre écran, certaines permissions Android doivent être accordées."}
          </Text>

          {/* 1. System Overlay Permission */}
          <Card style={styles.permissionCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleLarge" style={[styles.permissionTitle, { color: theme.colors.primary }]}>
                  {"1. Affichage par-dessus les autres applis"}
                </Text>
                <Text style={[styles.badge, { backgroundColor: theme.colors.errorContainer, color: theme.colors.onErrorContainer }]}>
                  {"Indispensable"}
                </Text>
              </View>
              <Text style={[styles.cardDescription, { color: theme.colors.onSurface }]}>
                {"Cette autorisation permet à l'application d'afficher la fenêtre popup contenant vos images par-dessus l'écran actuel."}
              </Text>
              <Text style={[styles.guideText, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant }]}>
                {"👉 Comment l'activer : Cliquez sur le bouton ci-dessous, puis recherchez 'ActivMotiv' dans la liste et cochez 'Autoriser l'affichage sur d'autres applications'."}
              </Text>
            </Card.Content>
          </Card>

          {/* 2. Xiaomi / Redmi Permissions */}
          <Card style={styles.permissionCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleLarge" style={[styles.permissionTitle, { color: theme.colors.primary }]}>
                  {"2. Fenêtres contextuelles en arrière-plan"}
                </Text>
                <Text style={[styles.badge, { backgroundColor: theme.colors.primaryContainer, color: theme.colors.onPrimaryContainer }]}>
                  {"Xiaomi / Redmi"}
                </Text>
              </View>
              <Text style={[styles.cardDescription, { color: theme.colors.onSurface }]}>
                {"Sur les appareils de marque Xiaomi, Redmi et POCO, le système bloque par défaut l'affichage d'écrans depuis l'arrière-plan."}
              </Text>
              <Text style={[styles.guideText, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant }]}>
                {"👉 Comment l'activer : Dans la page des paramètres de l'application, allez dans 'Autres autorisations' et autorisez 'Afficher les fenêtres pop-up en arrière-plan' et 'Afficher sur l'écran de verrouillage'."}
              </Text>
            </Card.Content>
          </Card>

          {/* 3. Battery Saver Exemption */}
          <Card style={styles.permissionCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleLarge" style={[styles.permissionTitle, { color: theme.colors.primary }]}>
                  {"3. Optimisation de la batterie"}
                </Text>
                <Text style={[styles.badge, { backgroundColor: theme.colors.primaryContainer, color: theme.colors.onPrimaryContainer }]}>
                  {"Recommandé"}
                </Text>
              </View>
              <Text style={[styles.cardDescription, { color: theme.colors.onSurface }]}>
                {"Pour éviter que le système d'exploitation ne ferme de manière agressive le service d'auto-ouverture afin d'économiser de la batterie."}
              </Text>
              <Text style={[styles.guideText, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant }]}>
                {"👉 Comment l'activer : Dans les paramètres de l'application, allez dans 'Économiseur de batterie' ou 'Optimisation de batterie' et sélectionnez 'Pas de restrictions'."}
              </Text>
            </Card.Content>
          </Card>

          {/* 4. Auto-start / Redémarrage automatique */}
          <Card style={styles.permissionCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleLarge" style={[styles.permissionTitle, { color: theme.colors.primary }]}>
                  {"4. Démarrage et redémarrage automatique"}
                </Text>
                <Text style={[styles.badge, { backgroundColor: theme.colors.errorContainer, color: theme.colors.onErrorContainer }]}>
                  {"Indispensable"}
                </Text>
              </View>
              <Text style={[styles.cardDescription, { color: theme.colors.onSurface }]}>
                {"Cette autorisation permet à l'application de démarrer automatiquement au démarrage du téléphone et de se relancer en arrière-plan pour assurer l'envoi des rappels et popups."}
              </Text>
              <Text style={[styles.guideText, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant }]}>
                {"👉 Comment l'activer : Dans les paramètres de votre téléphone ou de l'application, activez l'option 'Démarrage automatique' (ou 'Auto-start' / 'Lancement automatique en arrière-plan')."}
              </Text>
            </Card.Content>
          </Card>

          {isAtBottom && (
            <Button 
              mode="contained" 
              onPress={handleOpenSettings} 
              style={[styles.settingsButton, { backgroundColor: theme.colors.primary }]}
              icon="cog"
              labelStyle={{ fontWeight: 'bold', fontSize: 15, color: theme.colors.onPrimary }}
            >
              {"Ouvrir les Paramètres d'ActivMotiv"}
            </Button>
          )}
        </ScrollView>

        {!isAtBottom && (
          <View style={styles.floatingButtonContainer}>
            <Button 
              mode="contained" 
              onPress={handleOpenSettings} 
              style={[styles.settingsButton, { backgroundColor: theme.colors.primary }]}
              icon="cog"
              elevation={4}
              labelStyle={{ fontWeight: 'bold', fontSize: 15, color: theme.colors.onPrimary }}
            >
              {"Ouvrir les Paramètres d'ActivMotiv"}
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  introText: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'justify'
  },
  permissionCard: {
    marginBottom: 16,
    elevation: 1,
    borderRadius: 12
  },
  cardHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8
  },
  permissionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'justify'
  },
  guideText: {
    fontSize: 13,
    fontWeight: '500',
    padding: 10,
    borderRadius: 8,
    lineHeight: 18,
    textAlign: 'justify'
  },
  settingsButton: {
    paddingVertical: 6,
    borderRadius: 24,
    marginTop: 8,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 100,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  }
})
