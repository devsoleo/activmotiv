import { useState, ReactNode } from 'react'
import { Portal, Modal, Text, Button, useTheme } from 'react-native-paper'

interface InformationFrameProps {
  content: ReactNode
  actionName?: string
}

export default function InformationFrame({ content, actionName = "" }: InformationFrameProps) {
  const [visible, setVisible] = useState(true)
  const hideModal = () => setVisible(false)
  const theme = useTheme()

  return (
    <Portal>
      <Modal visible={visible} contentContainerStyle={{ backgroundColor: theme.colors.elevation.level3, margin: 20, padding: 24, borderRadius: 18 }}>
        <Text variant='titleLarge' style={{ marginBottom: 12, textAlign: 'center', color: theme.colors.onSurface }}>Information importante</Text>
        { content }
        <Button style={{ marginTop: 18 }} onPress={hideModal}>{ actionName || 'Fermer' }</Button>
      </Modal>
    </Portal>
  )
}
