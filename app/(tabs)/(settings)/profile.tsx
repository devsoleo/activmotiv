import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Image, StyleSheet, FlatList,  Dimensions, TouchableOpacity  } from 'react-native'
import { Appbar, TextInput, Text, Button } from 'react-native-paper'

import { Buffer } from 'buffer';
import { illustrationsList } from '@/constants/images'
import { useSession } from '@/contexts/auth'

export default function Profile() {
  const router = useRouter()
  const { session } = useSession()
  const [numColumns, setNumColumns] = useState(3)

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isPasswordSecure, setIsPasswordSecure] = useState(true)
  const [isPasswordConfirmSecure, setIsPasswordConfirmSecure] = useState(true)

  let uid = ""
  if (session != null && session != undefined) uid = JSON.parse(Buffer.from(session.split('.')[1], 'base64').toString())["uid"]

  const margin = 4
  const padding = 8

  const imageSize = (Dimensions.get('window').width - (padding * 2 + margin * 2 * numColumns)) / numColumns

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/(tabs)/(settings)/(profile)/note_image/${item.id}`)}
    >
    <Image
      source={item.source}
      style={[
        styles.image,
        {
          width: imageSize,
          height: imageSize,
          margin: margin,
          opacity: false ? 0.4 : 1
        },
      ]}
    />
    </TouchableOpacity>
  )

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
        {/* <Text variant="titleMedium" style={styles.title}>Modifier mon mot de passe</Text>
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
        </Button> */}
        <Text variant="titleMedium" style={styles.title}>Mes images</Text>
        <FlatList
          data={illustrationsList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
          contentContainerStyle={{ padding: padding }}
        />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  title: { marginLeft: 16 },
  image: { borderRadius: 8 },
})