import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { Appbar, TextInput, Text, Button } from 'react-native-paper'

import { Buffer } from 'buffer'
import { useSession } from '@/contexts/auth'

export default function Profile() {
  const router = useRouter()
  const { accessToken } = useSession()

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isPasswordSecure, setIsPasswordSecure] = useState(true)
  const [isPasswordConfirmSecure, setIsPasswordConfirmSecure] = useState(true)

  let uid = ""
  if (accessToken != null && accessToken != undefined) uid = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())["uid"]

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {router.back()}} />
        <Appbar.Content title="Mon profil" />
      </Appbar.Header>
        <Text variant="titleMedium" style={[styles.title, { marginTop: 16 }]}>Identifiant</Text>
        <TextInput
          value={uid}
          disabled
          style={{ margin: 16 }}
        />
        <Text variant="titleMedium" style={styles.title}>Modifier mon mot de passe</Text>
        <TextInput
          label="Nouveau mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={isPasswordSecure}
          right={<TextInput.Icon onPress={() => { isPasswordSecure ? setIsPasswordSecure(false) : setIsPasswordSecure(true) }} icon={isPasswordSecure ? "eye" : "eye-off" } />}
          style={{ margin: 16 }}
        />
        <TextInput
          label="Confirmer le mot de passe"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry={isPasswordConfirmSecure}
          right={<TextInput.Icon onPress={() => { isPasswordConfirmSecure ? setIsPasswordConfirmSecure(false) : setIsPasswordConfirmSecure(true) }} icon={isPasswordConfirmSecure ? "eye" : "eye-off" } />}
          style={{ margin: 16 }}
        />
        <Button mode="outlined" disabled={passwordConfirm.length == 0 || password.length == 0} style={{ margin: 16 }}>
          Modifier mon mot de passe
        </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  title: { marginLeft: 16 },
  image: { borderRadius: 8 },
})