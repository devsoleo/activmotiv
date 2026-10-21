import { useState } from 'react'
import { StyleSheet, Alert, Platform, TouchableOpacity, Image, Dimensions, KeyboardAvoidingView, View, Linking } from 'react-native'
import { TextInput, Button, Text, useTheme, IconButton, Portal, Dialog } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useSession } from '@/contexts/auth'
import { api } from '@/services/api'
import * as SAMCache from '@/services/cache/sam'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useSession()
  const theme = useTheme()

  const [uid, setUid] = useState('')
  const [password, setPassword] = useState('')

  const [isPasswordSecure, setIsPasswordSecure] = useState(true)
  const [loading, setLoading] = useState(false)
  const [infoModalVisible, setInfoModalVisible] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { uid, password })

      if (response.status == 200) {
        const data = response.data

        signIn(data.accessToken)

        SAMCache.loadFromServer()

        console.log("Connexion réussie !")

        router.replace("/(tabs)")
      } else {
        Alert.alert('Erreur', 'Identifiants invalides')
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignupRedirect = () => router.replace('/(auth)/register')
  const screenWidth = Dimensions.get('window').width

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <IconButton
        icon="information-outline"
        size={24}
        iconColor={theme.colors.primary}
        style={styles.infoButton}
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
    top: Platform.OS === 'ios' ? 48 : 20,
    right: 16,
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