import { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { StyleSheet, View, Image, Dimensions, FlatList, TouchableOpacity } from 'react-native'
import { Text, Appbar, IconButton, useTheme } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { illustrationsList, arousalList, valenceList } from '@/constants/images'
import { api } from '@/services/api'
import { getNetworkStateAsync } from 'expo-network'
import * as SAMCache from '@/services/cache/sam'

export default function NoteImage() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const theme = useTheme()

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

  const renderOption = (variant: string, { item }: { item: any }, selectedId: number | null, setSelectedId: (val: any) => void) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedId(Number(item.id))
      }}
      style={{ marginTop: 60 }}>
      {item.id == '1' ? <Text style={{ position: 'absolute', top: -20 }}>{ variant == 'valence' ? 'Très calme \\ très détendu' : 'Très désagréable / négative'}</Text> : null}
      {item.id == '5' ? <Text style={{ position: 'absolute', left: 6, top: -20}}>{ variant == 'valence' ? 'Surexcité / très stimulé' : 'Très agréable / positive'}</Text> : null}

      <Image
        source={item.source}
        style={[
          styles.image,
          {
            width: imageSize,
            height: imageSize,
            margin: margin,
            marginTop: item.id == 5 || item.id == 1 ? 20 : 0,
            borderWidth: item.id == selectedId ? 2 : 0,
            borderColor: theme.colors.primary,
          },
        ]}
      />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
      <View style={{ marginTop: 20 }}>
        <Text variant='titleMedium' style={{ textAlign: 'center', position: 'relative', top: 20 }}>Quand je regarde cette image, je me sens...</Text>
        <FlatList
          data={valenceList}
          renderItem={(item) => renderOption('valence', item, valence, setValence)}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
          contentContainerStyle={{ padding: padding }}
        />
        <Text variant='titleMedium' style={{ textAlign: 'center', position: 'relative', top: 20 }}>Quand je regarde cette image, je la trouve...</Text>
        <FlatList
          data={arousalList}
          renderItem={(item) => renderOption('arousal', item, arousal, setArousal)}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
          contentContainerStyle={{ padding: padding }}
        />
      </View>
      <View style={{ marginTop: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center'}}>
        <IconButton
          icon={ hidden ? 'eye-off' : 'eye'}
          size={40}
          onPress={() => {}}
          iconColor={ hidden ? 'gray' : theme.colors.primary}
          onPressOut={() => {
            setHidden(!hidden)
          }}
        />
        </View>
        <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center'}}>
          <IconButton
            icon="chevron-left"
            size={40}
            onPress={() => setImageId(imageId - 1)}
            disabled={imageId <= 1}
            iconColor={theme.colors.primary}
          />
          <IconButton
            icon="chevron-right"
            size={40}
            onPress={() => setImageId(imageId + 1)}
            disabled={imageId >= illustrationsList.length}
            iconColor={theme.colors.primary}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    borderColor: "rgb(0, 99, 153)"
  },
})