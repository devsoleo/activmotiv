import * as React from 'react'
import { View, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useSession } from '@/contexts/auth'
import { Dimensions } from 'react-native'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useSession()

  const [uid, setUid] = React.useState('81fbdec3')
  const [password, setPassword] = React.useState('15022004')
  const [isPasswordSecure, setIsPasswordSecure] = React.useState(true);
  const [loading, setLoading] = React.useState(false)

  const handleLogin = async () => {
    setLoading(true)

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid, password })
      })

      const data = await response.json()

      if (response.ok) {
        signIn(data.token)
        console.log("Connexion réussie !")
        router.replace("/(tabs)")
      } else {
        Alert.alert('Erreur', 'Identifiants invalides')
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignupRedirect = () => router.replace('/(auth)/register')
  const screenWidth = Dimensions.get('window').width

  return (
    <View style={styles.wrapper}>

      <View style={styles.container}>
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
        <Text variant="headlineLarge" style={{ textAlign: 'center', marginBottom: 45 }}>Se connecter</Text>
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
      </View>

      <TouchableOpacity onPress={handleSignupRedirect}>
        <Text style={styles.signupText}>Première connexion ?</Text>
      </TouchableOpacity>

      <Text style={styles.signupText}>{process.env.EXPO_PUBLIC_API_URL}</Text>
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
    marginBottom: 64,
  },
})
