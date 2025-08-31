import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Card, Button } from 'react-native-paper'
import { api } from '@/api/client'

export default function HomeScreen() {
  const router = useRouter()

  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    api.get('/notifications')
    .then((response) => response.data)
    .then((data) => {
      setNotifications(data)
    })
    .catch((error) => {
      console.error(error)
    })
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <Text variant="headlineLarge" style={styles.title}>Accueil</Text>
      <ScrollView>
        {notifications.map((item) => (
          <Card key={item.id} style={{ margin: 10 }}>
            <Card.Content>
              <Text variant="titleLarge">{ item.title }</Text>
              <Text variant="bodyMedium">{ item.body }</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="text" onPress={() => router.push(item.action.path)}>{ item.action.text }</Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingTop: 45, paddingBottom: 15 },
})