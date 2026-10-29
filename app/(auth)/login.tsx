import { useState } from 'react'
import { StyleSheet, Platform, TouchableOpacity, Image, Dimensions, KeyboardAvoidingView, View, Linking } from 'react-native'
import { TextInput, Button, Text, useTheme, IconButton, Portal, Dialog, Icon } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useSession } from '@/contexts/auth'
import { api } from '@/services/api'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useSession()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const [uid, setUid] = useState('')
  const [password, setPassword] = useState('')

  const [isPasswordSecure, setIsPasswordSecure] = useState(true)
  const [loading, setLoading] = useState(false)
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [errorModal, setErrorModal] = useState<{
    visible: boolean
    title: string
    message: string
    icon: string
  }>({
    visible: false,
    title: '',
    message: '',
    icon: 'alert-circle-outline',
  })

  const showAlert = (title: string, message: string, icon: string = 'alert-circle-outline') => {
    setErrorModal({
      visible: true,
      title,
      message,
      icon,
    })
  }

  const handleLogin = async () => {
    if (!uid.trim() || !password.trim()) {
      showAlert(
        'Champs requis',
        'Veuillez saisir votre identifiant et votre mot de passe.',
        'alert-circle-outline'
      )
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/login', { uid, password })

      if (response.status === 200) {
        const data = response.data
        signIn(data.accessToken)
        console.log("Connexion réussie !")
        router.replace("/(tabs)")
      } else {
        showAlert(
          'Identifiants invalides',
          'L\'identifiant ou le mot de passe est incorrect.',
          'lock-alert-outline'
        )
      }
    } catch (error: any) {
      console.log("Login error:", error)
      const isNetworkErr = !error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('network')

      if (isNetworkErr) {
        showAlert(
          'Connexion réseau impossible',
          'Impossible de contacter le serveur ActivMotiv.\n\nVeuillez vérifier votre connexion Internet (Wi-Fi ou données mobiles) et réessayez.',
          'wifi-off'
        )
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        showAlert(
          'Identifiants incorrects',
          error.response?.data?.error || 'L\'identifiant ou le mot de passe saisi est incorrect.',
          'lock-alert-outline'
        )
      } else {
        showAlert(
          'Erreur de connexion',
          error.response?.data?.error || error.message || 'Une erreur inattendue est survenue lors de la connexion.',
          'alert-circle-outline'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignupRedirect = () => router.replace('/(auth)/register')
  const screenWidth = Dimensions.get('window').width

  return (
    <KeyboardAvoidingView behavior={'height'} style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <IconButton
        icon="information-outline"
        size={24}
        iconColor={theme.colors.primary}
        style={[styles.infoButton, { top: Math.max(insets.top + 8, 16), right: Math.max(insets.right + 8, 16) }]}
        onPress={() => setInfoModalVisible(true)}
      />

      <Image
        style={{
          width: screenWidth,
          height: undefined,
          aspectRatio: 3,
          resizeMode: 'contain',
          alignSelf: 'center',
          marginBottom: 45,
        }}
        source={theme.dark ? require("@/assets/images/activmotiv-dark.png") : require("@/assets/images/activmotiv.png")}
      />
      <Text variant="headlineLarge" style={{ fontWeight: "bold", textAlign: 'center', marginBottom: 45 }}>Se connecter</Text>
      <TextInput
        label="Identifiant"
        value={uid}
        onChangeText={setUid}
        autoCapitalize="none"
        right={<TextInput.Affix text={uid.length + "/8"} />}
        maxLength={8}
        style={styles.input}
      />
      <TextInput
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={isPasswordSecure}
        right={<TextInput.Icon onPress={() => { isPasswordSecure ? setIsPasswordSecure(false) : setIsPasswordSecure(true) }} icon={isPasswordSecure ? "eye" : "eye-off" } />}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Se connecter
      </Button>

      <TouchableOpacity style={{ marginTop: 32 }} onPress={handleSignupRedirect}>
        <Text style={[styles.signupText, { color: theme.colors.primary }]}>Première connexion ?</Text>
      </TouchableOpacity>

      <Portal>
        <Dialog
          visible={errorModal.visible}
          onDismiss={() => setErrorModal((prev) => ({ ...prev, visible: false }))}
          style={{ borderRadius: 16 }}
        >
          <View style={{ alignItems: 'center', paddingTop: 20 }}>
            <Icon source={errorModal.icon} size={48} color={theme.colors.error} />
          </View>
          <Dialog.Title style={{ textAlign: 'center', fontWeight: 'bold' }}>
            {errorModal.title}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              {errorModal.message}
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 16 }}>
            <Button
              mode="contained"
              onPress={() => setErrorModal((prev) => ({ ...prev, visible: false }))}
              style={{ minWidth: 120, borderRadius: 8 }}
            >
              Compris
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={infoModalVisible} onDismiss={() => setInfoModalVisible(false)}>
          <Dialog.Title style={{ textAlign: 'center' }}>Informations</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <View style={styles.infoSection}>
              <Text variant="labelLarge" style={{ color: theme.colors.outline }}>Domaine d'API :</Text>
              <Text variant="bodyMedium" selectable>{process.env.EXPO_PUBLIC_API_URL || 'Non défini'}</Text>
            </View>
            <View style={styles.infoSection}>
              <Text variant="labelLarge" style={{ color: theme.colors.outline, marginBottom: 8 }}>Signalement de bug :</Text>
              <Button
                mode="outlined"
                icon="bug"
                onPress={() => Linking.openURL("https://sondage.umontpellier.fr/ls/index.php/325198")}
              >
                Signaler un bug
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInfoModalVisible(false)}>Fermer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  infoButton: {
    position: 'absolute',
    zIndex: 10,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
  signupText: {
    textAlign: 'center',
  },
  dialogContent: {
    gap: 16,
  },
  infoSection: {
    gap: 4,
  },
})