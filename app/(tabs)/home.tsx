import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Banner, Card, Button } from 'react-native-paper'
import { useSession } from '@/contexts/auth'

export default function HomeScreen() {
  const { session } = useSession()
  const [visible, setVisible] = useState(true)
  const router = useRouter()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true); // pour gérer le chargement

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/notifications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session}`
          }
      })
      .then((response) => response.json())
      .then((json) => {
        setNotifications(json)
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setLoading(false)
      })
  }, [])

  return (
    <View style={{ flex: 1}}>
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