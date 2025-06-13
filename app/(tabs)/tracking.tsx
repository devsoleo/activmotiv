import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

export default function TrackingScreen() {
  return (
    <View style={{ flex: 1}}>
      <Text variant="headlineLarge" style={styles.title}>Suivi</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingTop: 45, paddingBottom: 15 },
})