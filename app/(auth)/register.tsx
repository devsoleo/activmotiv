import * as React from 'react'
import { View, StyleSheet, Platform, TouchableOpacity, Dimensions, Image, Alert, KeyboardAvoidingView } from 'react-native'
import { TextInput, Text, Button, useTheme } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { api } from '@/services/api'

export default function Register() {
  const router = useRouter()
  const theme = useTheme()

  const [uid, setUid] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [passwordConfirm, setPasswordConfirm] = React.useState('')
  const [isPasswordSecure, setIsPasswordSecure] = React.useState(true)
  const [isPasswordConfirmSecure, setIsPasswordConfirmSecure] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  const handleSignupRedirect = () => router.replace('/(auth)/login')
  const screenWidth = Dimensions.get('window').width

  const handleRegister = async () => {
    setLoading(true)

    try {
      const response = await api.post('/auth/first-login', { uid, password })

      if (response.status == 200) {
        router.replace("/(auth)/login")
      } else {
        Alert.alert('Erreur', 'Identifiants invalides')
      }
    } catch (error: any) {
      Alert.alert('Erreur', 'Une erreur est survenue')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <Image
        style={{
          width: screenWidth,
          height: undefined,
          aspectRatio: 3,
          resizeMode: 'contain',
          alignSelf: 'center',
          marginBottom: 45,
        }}
        source={require("@/assets/images/activmotiv.png")}
      />

      <Text variant="headlineLarge" style={{ textAlign: 'center', marginBottom: 45 }}>Première connexion</Text>

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
        label="Créer un mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={isPasswordSecure}
        right={<TextInput.Icon onPress={() => { isPasswordSecure ? setIsPasswordSecure(false) : setIsPasswordSecure(true) }} icon={isPasswordSecure ? "eye" : "eye-off" } />}
        style={styles.input}
      />
      <TextInput
        label="Confirmer le mot de passe"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry={isPasswordConfirmSecure}
        right={<TextInput.Icon onPress={() => { isPasswordConfirmSecure ? setIsPasswordConfirmSecure(false) : setIsPasswordConfirmSecure(true) }} icon={isPasswordConfirmSecure ? "eye" : "eye-off" } />}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Se connecter
      </Button>

      <TouchableOpacity style={{ marginTop: 32 }} onPress={handleSignupRedirect}>
        <Text style={[styles.signupText, { color: theme.colors.primary }]}>Déjà inscrit ?</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
  signupText: {
    textAlign: 'center',
    marginBottom: 64,
  },
})
