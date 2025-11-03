import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Image, StyleSheet, FlatList,  Dimensions, TouchableOpacity } from 'react-native'
import { Appbar, Text } from 'react-native-paper'

import { illustrationsList } from '@/constants/images'
import InformationFrame from '@/components/InformationFrame'

export default function Images() {
  const router = useRouter()
  const [numColumns, setNumColumns] = useState(3)

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
        <Appbar.Content title="Mes images" />
      </Appbar.Header>
      <InformationFrame actionName="Accéder à mes images" content={<>
        <Text style={{ textAlign: 'justify' }}>
          Dans cette section, vous allez évaluer une série d'images présentées dans l'application.
          L'objectif est de connaître les émotions et le niveau d'activation que ces images suscitent chez vous.
        </Text>
        <Text style={{ paddingTop: 12 }}>
          Pour <Text style={{ fontWeight: "bold" }}>chaque image</Text>, vous indiquerez :
        </Text>
        <Text style={{ paddingTop: 8, paddingLeft: 12 }}>• À quel point elle vous <Text style={{ fontWeight: "bold" }}>stimule</Text> ou vous <Text style={{ fontWeight: "bold" }}>calme</Text> (activation : très calme → surexcité(e)/stimulé(e)).</Text>
        <Text style={{ paddingTop: 8, paddingLeft: 12 }}>• À quel point l'image vous semble <Text style={{ fontWeight: "bold" }}>agréable</Text> ou <Text style={{ fontWeight: "bold" }}>désagréable</Text> (émotion : très négative → très positive).</Text>
        <Text style={{ paddingTop: 12, textAlign: 'justify' }}>
          Pour cela, vous utiliserez des petits personnages illustrés représentant ces deux dimensions.
          Il vous suffit simplement de choisir, pour chaque image, le personnage qui correspond le mieux à votre ressenti.
        </Text>
        <Text style={{ paddingTop: 12, fontWeight: 'bold', textAlign: 'justify' }}>
          Il n'y a pas de bonne ou mauvaise réponse : l'important est de répondre de manière spontanée et sincère.
        </Text>
      </>}/>
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