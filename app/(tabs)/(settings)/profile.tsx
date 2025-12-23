import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, View, Linking } from 'react-native'
import { Appbar, TextInput, Text, Button, Snackbar } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import Clipboard from '@react-native-clipboard/clipboard'
import { Buffer } from 'buffer'
import { useSession } from '@/contexts/auth'
import { api } from '@/services/api'
import { getNetworkStateAsync } from 'expo-network'

export default function Profile() {
  const router = useRouter()
  const { accessToken } = useSession()

  const [currentPassword, setCurrentPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [isCurrentPasswordSecure, setIsCurrentPasswordSecure] = useState(true)
  const [isNewPasswordSecure, setIsNewPasswordSecure] = useState(true)
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true)

  const [visible, setVisible] = useState(false)
  const [snackbarText, setSnackbarText] = useState('')

  const dismissSnackbar = () => setVisible(false)

  let uid = ""
  if (accessToken != null && accessToken != undefined) uid = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())["uid"]

  return (
    <SafeAreaView style={{ flex: 1}}>
      <ScrollView keyboardShouldPersistTaps="always">
        <Appbar.Header>
          <Appbar.BackAction onPress={() => {router.back()}} />
          <Appbar.Content title="Mon profil" />
        </Appbar.Header>
          <Text variant="titleMedium" style={[styles.title, { marginTop: 16 }]}>Identifiant</Text>
          <View
            onTouchEnd={() => {
              Clipboard.setString(uid)
              setSnackbarText("UID copié dans le presse papier !")
              setVisible(true)
          }}>
            <TextInput
              value={uid}
              disabled
              style={{ margin: 16 }}
            />
          </View>
          <Text variant="titleMedium" style={styles.title}>Modifier mon mot de passe</Text>
          <TextInput
            label="Mot de passe actuel"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={isCurrentPasswordSecure}
            right={<TextInput.Icon onPress={() => { isCurrentPasswordSecure ? setIsCurrentPasswordSecure(false) : setIsCurrentPasswordSecure(true) }} icon={isCurrentPasswordSecure ? "eye" : "eye-off" } />}
            style={{ margin: 16 }}
          />
          <TextInput
            label="Nouveau mot de passe"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={isNewPasswordSecure}
            right={<TextInput.Icon onPress={() => { isNewPasswordSecure ? setIsNewPasswordSecure(false) : setIsNewPasswordSecure(true) }} icon={isNewPasswordSecure ? "eye" : "eye-off" } />}
            style={{ margin: 16 }}
          />
          <TextInput
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={isConfirmPasswordSecure}
            right={<TextInput.Icon onPress={() => { isConfirmPasswordSecure ? setIsConfirmPasswordSecure(false) : setIsConfirmPasswordSecure(true) }} icon={isConfirmPasswordSecure ? "eye" : "eye-off" } />}
            style={{ margin: 16 }}
          />
          <Button mode="outlined" disabled={(newPassword.length == 0) || newPassword != confirmPassword} style={{ margin: 16 }} onPress={async () => {
            const networkState = await getNetworkStateAsync()
            if (!networkState.isConnected) {
              setSnackbarText("Action impossible hors-ligne !")
              setVisible(true)
              return
            }

            try {
              const response = await api.post('/auth/reset-password', { current_password: currentPassword, new_password: newPassword })

              if (response.status == 200) {
                setSnackbarText("Votre mot de passe a bien été modifié !")
                setVisible(true)
              } else {
                setSnackbarText("Une erreur est survenue !")
                setVisible(true)
              }
            } catch (error) {
              setSnackbarText("Une erreur est survenue !")
              setVisible(true)
              console.error(error)
            }
          }}>
            Modifier mon mot de passe
          </Button>
      </ScrollView>
      <Button onPress={() => Linking.openURL("https://sondage.umontpellier.fr/ls/index.php/636317?lang=fr")} textColor="#EF5350" style={{ marginHorizontal: 16 }}>Supprimer mon compte</Button>
      <Snackbar
        visible={visible}
        duration={5000}
        onDismiss={dismissSnackbar}>
        {snackbarText}
      </Snackbar>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  title: { marginLeft: 16 },
  image: { borderRadius: 8 },
})