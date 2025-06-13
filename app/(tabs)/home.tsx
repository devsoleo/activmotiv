import { useRouter } from 'expo-router'
import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Banner } from 'react-native-paper'

export default function HomeScreen() {
  const [visible, setVisible] = useState(true)
  const router = useRouter()

  return (
    <View style={{ flex: 1}}>
      <Text variant="headlineLarge" style={styles.title}>Accueil</Text>

      <Banner style={{ margin: 10 }}
        visible={visible}
        actions={[
          {
            label: 'Choisir mes images',
            onPress: () => router.push("/(tabs)/(settings)/profile"),
          }
        ]}>
        Pensez à compléter votre profil et à choisir vos images !
      </Banner>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingTop: 45, paddingBottom: 15 },
})