import * as React from 'react'
import { View, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native'
import { TextInput, Text, Button } from 'react-native-paper'
import { useRouter } from 'expo-router'

export default function Register() {
  const router = useRouter()

  const [uid, setUid] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [passwordConfirm, setPasswordConfirm] = React.useState('')
  const [isPasswordSecure, setIsPasswordSecure] = React.useState(true)
  const [isPasswordConfirmSecure, setIsPasswordConfirmSecure] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  const handleSignupRedirect = () => router.replace('/(auth)/login')
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

        <Text variant="headlineLarge" style={{ textAlign: 'center', marginBottom: 45 }}>Première connexion</Text>

        <TextInput
          label="Identifiant"
          value={uid}
          onChangeText={setUid}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          label="Créer un mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={isPasswordSecure}
          right={<TextInput.Icon onPress={() => { isPasswordSecure ? setIsPasswordSecure(false) : setIsPasswordSecure(true) }} icon="eye" />}
          style={styles.input}
        />
        <TextInput
          label="Confirmer le mot de passe"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry={isPasswordConfirmSecure}
          right={<TextInput.Icon onPress={() => { isPasswordConfirmSecure ? setIsPasswordConfirmSecure(false) : setIsPasswordConfirmSecure(true) }} icon="eye" />}
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={() => {}}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Se connecter
        </Button>
      </View>

      <TouchableOpacity onPress={handleSignupRedirect}>
        <Text style={styles.signupText}>Déjà inscrit ?</Text>
      </TouchableOpacity>
    </View>
  );
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
});
