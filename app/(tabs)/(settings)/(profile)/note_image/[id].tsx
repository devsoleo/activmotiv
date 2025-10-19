import { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Text, StyleSheet, View, Image, Dimensions, FlatList, TouchableOpacity } from 'react-native'
import { Appbar, IconButton } from 'react-native-paper'
import { illustrationsList, arousalList, valenceList } from '@/constants/images'
import { api } from '@/services/api'
import { getNetworkStateAsync } from 'expo-network'
import * as SAMCache from '@/services/cache/sam'

export default function NoteImage() {
  const router = useRouter()
  const { id } = useLocalSearchParams()

  const [imageId, setImageId] = useState(Number(id))
  const [valence, setValence] = useState(null)
  const [arousal, setArousal] = useState(null)
  const [hidden, setHidden] = useState(false)

  const screenWidth = Dimensions.get('window').width
  const [numColumns, setNumColumns] = useState(5)
  const margin = 4
  const padding = 8

  const imageSize = (screenWidth - (padding * 2 + margin * 2 * numColumns)) / numColumns

  const sendRating = async () => {
    SAMCache.addImage({ image: imageId, valence, arousal, hidden })

    // DO THIS ON APP OPENING
    const networkState = await getNetworkStateAsync()

    if (networkState.isConnected) {
      api.put(`/sam/image/${imageId}`, { valence, arousal, hidden })
      .then(() => {
        console.log("Note envoyée !")
      })
      .catch((error) => {
        console.error(error)
      })
    }
  }

  useEffect(() => {
    const loadImage = async () => {
      setValence(null)
      setArousal(null)
      setHidden(false)

      const image = await SAMCache.getImage(imageId)

      if (image == undefined) {
        console.log("STEP 1: not in cache")
        const networkState = await getNetworkStateAsync()

        if (networkState.isConnected) {
          console.log("STEP 2: ask server")

          api.get(`/sam/image/${imageId}`)
          .then((response) => response.data)
          .then((data) => {
            console.log("STEP 3: found so store in cache")

            SAMCache.addImage(data)

            setValence(data.valence)
            setArousal(data.arousal)
            setHidden(data.hidden)
          })
          .catch((error) => {
            // console.error(error)
          })
        }

        return
      }

      console.log("STEP 1: " + imageId + " found in cache")

      setValence(image.valence)
      setArousal(image.arousal)
      setHidden(image.hidden)
    }

    loadImage()
  }, [imageId])

  useEffect(() => {
    if (!arousal && !valence && !hidden) return

    sendRating()
  }, [valence, arousal, hidden])

  const renderOption = ({ item }, selectedId, setSelectedId) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedId(Number(item.id))
      }}
      style={{ marginTop: 60 }}>
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
          data={valenceList}
          renderItem={(item) => renderOption(item, valence, setValence)}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
          contentContainerStyle={{ padding: padding }}
        />
        <FlatList
          data={arousalList}
          renderItem={(item) => renderOption(item, arousal, setArousal)}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
          contentContainerStyle={{ padding: padding }}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 100 }}>
          <IconButton
            icon={ hidden ? 'eye-off' : 'eye'}
            size={40}
            onPress={() => {}}
            iconColor={ hidden ? 'gray' : 'rgba(0, 99, 153, 0.7)'}
            style={{ margin: 'auto' }}
            onPressOut={() => {
              setHidden(!hidden)
            }}
          />
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