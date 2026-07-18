import React from 'react'
import { StyleSheet } from 'react-native'
import { Card, Text, Button, useTheme } from 'react-native-paper'
import { useRouter } from 'expo-router'

interface TaskProps {
  item: {
    id: string
    uid: string
    title: string
    content: string
    action: {
      path: string
      text: string
    }
  }
  disabled: boolean
}

export default function Task({ item, disabled }: TaskProps) {
  const theme = useTheme()
  const router = useRouter()

  return (
    <Card 
      style={[styles.card, { opacity: disabled ? 0.5 : 1 }]} 
      mode={disabled ? 'contained' : 'elevated'}
    >
      <Card.Content>
        <Text variant="titleMedium">{item.title}</Text>
        <Text variant="bodyMedium" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
          {item.content}
        </Text>
      </Card.Content>
      <Card.Actions>
        {!disabled && (
          <Button mode="text" onPress={() => router.push(item.action.path as any)}>
            {item.action.text}
          </Button>
        )}
      </Card.Actions>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 8
  }
})
