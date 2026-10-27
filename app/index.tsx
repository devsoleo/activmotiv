import { Redirect } from 'expo-router'
import React from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'

export default function Home() {
  const theme = useTheme()
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <Redirect href="/(auth)/login" />
    </View>
  )
}
