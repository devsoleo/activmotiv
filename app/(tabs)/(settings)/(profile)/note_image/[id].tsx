import { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Text, StyleSheet, View, Image, Dimensions, FlatList, TouchableOpacity } from 'react-native'
import { Appbar, IconButton } from 'react-native-paper'
import { useSession } from '@/contexts/auth'
import { illustrationsList, arousalList, valenceList } from '@/constants/images'

export default function Note() {
  const router = useRouter()
  const { session } = useSession()
  const { id } = useLocalSearchParams()

  const [imageId, setImageId] = useState(Number(id))
  const [valence, setValence] = useState(1)
  const [arousal, setArousal] = useState(1)

  const screenWidth = Dimensions.get('window').width
  const [numColumns, setNumColumns] = useState(5)
  const margin = 4
  const padding = 8

  const imageSize = (screenWidth - (padding * 2 + margin * 2 * numColumns)) / numColumns

  useEffect(() => {
    const getAge = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/images/${imageId}/rating`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session}`
          }
        })

        // TODO : Fix avec un .then
        // app/(tabs)/home.tsx#L14
        const data = (await response.json()).data

        setValence(data.valence)
        setArousal(data.arousal)
      } catch (e) {
        console.error(e)
      }
    }

    getAge()
  }, [imageId])

  useEffect(() => {
    const sendRating = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/images/${imageId}/rating`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session}`
          },
          body: JSON.stringify({ valence, arousal })
        })

        if (response.ok) {
          console.log("Note envoyée !")
        }
      } catch (error) {
        console.error(error)
      }
    }

    sendRating()
  }, [valence, arousal])

  const renderOption = ({ item }, selectedId, setSelectedId) => (
    <TouchableOpacity
      onPress={() => setSelectedId(item.id)}
      style={{ marginTop: 60 }}
    >

    {item.id == 1 ? <Text style={{ }}>Pas beaucoup</Text> : <Text></Text>}
    {item.id == 5 ? <Text style={{ position: "relative", left: -8, top: -19 }}>Beaucoup</Text> : <Text></Text>}

      <Image
        source={item.source}
        style={[
          styles.image,
          {
            width: imageSize,
            height: imageSize,
            margin: margin,
            borderWidth: item.id == selectedId ? 2 : 0,
          },
        ]}
      />
    </TouchableOpacity>
  )

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {router.back()}} />
        <Appbar.Content title="Mes images" />
      </Appbar.Header>
      <View style={{ alignItems: 'center' }}>
        <Image
          style={{
          width: screenWidth * 0.8,
          height: undefined,
          aspectRatio: 16 / 9,
          resizeMode: 'cover',
        }}
          source={illustrationsList.filter((i) => i.id == String(imageId))[0].source}
        />
      </View>
      <View>
        <FlatList
          data={arousalList}
          renderItem={(item) => renderOption(item, valence, setValence)}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
          contentContainerStyle={{ padding: padding }}
        />
        <FlatList
          data={valenceList}
          renderItem={(item) => renderOption(item, arousal, setArousal)}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
          contentContainerStyle={{ padding: padding }}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 100 }}>
        <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center'}}>
          <IconButton
            icon="chevron-left"
            size={40}
            onPress={() => setImageId(imageId - 1)}
            disabled={imageId <= 1}
            iconColor='rgba(0, 99, 153, 0.7)'
          />
          <IconButton
            icon="chevron-right"
            size={40}
            onPress={() => setImageId(imageId + 1)}
            disabled={imageId >= illustrationsList.length}
            iconColor='rgba(0, 99, 153, 0.7)'
          />
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  image: { 
    borderRadius: 8,
    borderColor: "rgb(0, 99, 153)"
  },
})