import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Card, Text, Button, useTheme } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'

interface TaskProps {
  item: {
    id: string
    uid: string
    title: string
    content: string
    image?: string
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
      <Card.Content style={styles.contentRow}>
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.taskImage}
            contentFit="contain"
          />
        )}
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.title}</Text>
          <Text variant="bodyMedium" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
            {item.content}
          </Text>
        </View>
      </Card.Content>
      <Card.Actions>
        {!disabled && (
          <Button mode="contained-tonal" onPress={() => router.push(item.action.path as any)}>
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
    borderRadius: 12
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  textContainer: {
    flex: 1
  },
  taskImage: {
    width: 56,
    height: 56,
    marginRight: 14,
    borderRadius: 8
  }
})