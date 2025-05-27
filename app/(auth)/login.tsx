import * as React from 'react'
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useSession } from '@/contexts/auth'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useSession()

  const [uid, setUid] = React.useState('81fbdec3')
  const [password, setPassword] = React.useState('15022004')
  const [loading, setLoading] = React.useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://activmotiv.devsoleo.fr/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid, password })
      })

      const data = await response.json()

      if (response.ok) {
        signIn(data.token)
        Alert.alert('Succès', 'Connexion réussie !')
        router.replace("/(tabs)/home")
      } else {
        Alert.alert('Erreur', data.error ?? 'Identifiants invalides')
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignupRedirect = () => router.replace('/(auth)/register')

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TextInput
          label="Identifiant"
          value={uid}
          onChangeText={setUid}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
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
      </View>

      <TouchableOpacity onPress={handleSignupRedirect}>
        <Text style={styles.signupText}>Pas encore inscrit ?</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  container: {
    justifyContent: 'center',
    flex: 1,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
  signupText: {
    textAlign: 'center',
    color: '#1e90ff',
    marginBottom: 24,
  },
})
