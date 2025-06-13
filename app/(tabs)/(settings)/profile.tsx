import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Image, StyleSheet, FlatList,  Dimensions } from 'react-native'
import { Appbar, TextInput, Text, Button } from 'react-native-paper'

import { illustrationsList } from '@/constants/illustrations'

export default function Profile() {
  const router = useRouter()

  const [numColumns, setNumColumns] = useState(3)

  const margin = 4;
  const padding = 8;

  const imageSize = (Dimensions.get('window').width - (padding * 2 + margin * 2 * numColumns)) / numColumns

  const renderItem = ({ item }) => (
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
  );

  return (
    <ScrollView>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {router.back()}} />
        <Appbar.Content title="Mon profil" />
      </Appbar.Header>
        <Text variant="titleLarge" style={styles.title}>Mes informations</Text>
        <Text variant="titleMedium" style={styles.title}>Identifiant</Text>
        <TextInput
          value={"azeaeazeaez"}
          readOnly
          style={{ margin: 16 }}
        />
        <Text variant="titleMedium" style={styles.title}>Mot de passe</Text>
        <TextInput
          label="Mot de passe"
          secureTextEntry
          style={{ margin: 16 }}
        />
        <TextInput
          label="Confirmer le mot de passe"
          secureTextEntry
          style={{ margin: 16 }}
        />
        <Button mode="contained" style={{ margin: 16 }}>
          Modifier mon mot de passe
        </Button>
        <Text variant="titleLarge" style={styles.title}>Mes photos</Text>
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
  title: { margin: 16 },
  image: { borderRadius: 8 },
})