import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Image, StyleSheet, FlatList,  Dimensions, TouchableOpacity  } from 'react-native'
import { Appbar } from 'react-native-paper'

import { illustrationsList } from '@/constants/images'

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