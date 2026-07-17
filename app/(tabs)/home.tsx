import { useState, useCallback } from 'react'
import { api } from '@/services/api'
import { useRouter, useFocusEffect } from 'expo-router'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Card, Button, useTheme } from 'react-native-paper'
import { tasksList } from '@/constants/tasks'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function HomeScreen() {
  const theme = useTheme()
  const router = useRouter()

  const [status, setStatus] = useState<Record<string, any>>({})

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
        api.put('/notifications/token', { fcmToken: e.data })
      })

      const registerDevice = async () => {
        const androidId = await AsyncStorage.getItem('androidId')

        if (!androidId) console.log('androidId manquant')

        await api.put('/telemetry/device', { androidId, device: Device })
      }

      registerDevice()
    }, [])
  )

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text variant="headlineLarge" style={styles.title}>Questionnaires</Text>
      <ScrollView>
        {tasksList.map((item) => (
          <Card key={item.id} style={{ margin: 10, opacity: status[item.uid] ? 1 : 0.5 }} mode={(status[item.uid]) ? 'elevated' : 'contained'}>
            <Card.Content>
              <Text variant="titleLarge">{ item.title }</Text>
              <Text variant="bodyMedium">{ item.status['open'].content }</Text>
            </Card.Content>
            <Card.Actions>
              {(() => {
                if (!status[item.uid]) return null
                const path: any = item.status['open'].action.path
                return <Button mode="text" onPress={() => router.push(path)}>{ item.status['open'].action.text }</Button>
              })()}
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