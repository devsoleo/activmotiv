import { useState, useCallback } from 'react'
import { api } from '@/services/api'
import { useRouter, useFocusEffect } from 'expo-router'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Card, Button } from 'react-native-paper'
import { tasksList } from '@/constants/tasks'
import * as Notifications from 'expo-notifications'

export default function HomeScreen() {
  const router = useRouter()

  const [status, setStatus] = useState({})

  useFocusEffect(
    useCallback(() => {
      api.get('/tasks/status')
      .then((response) => response.data)
      .then((data) => {
        setStatus(data.status)
      })
      .catch((error) => {
        console.error(error)
      })

      Notifications.getDevicePushTokenAsync().then(e => {
        api.post('/notifications/token', { token: e.data })
      })
    }, [])
  )

  return (
    <View style={{ flex: 1 }}>
      <Text variant="headlineLarge" style={styles.title}>Accueil</Text>
      <ScrollView>
        {tasksList.map((item) => (
          <Card key={item.id} style={{ margin: 10, opacity: status[item.uid] ? 1 : 0.5 }} mode={(status[item.uid]) ? 'elevated' : 'contained'}>
            <Card.Content>
              <Text variant="titleLarge">{ item.title }</Text>
              <Text variant="bodyMedium">{ item.status['open'].content }</Text>
            </Card.Content>
            <Card.Actions>
              {status[item.uid] && <Button mode="text" onPress={() => router.push(item.status['open'].action.path)}>{ item.status['open'].action.text }</Button>}
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingTop: 45, paddingBottom: 15, fontWeight: "bold" },
})