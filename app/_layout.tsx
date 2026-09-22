import { useEffect, useRef } from 'react'
import { Stack, useRouter } from 'expo-router'
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper'
import { useColorScheme } from 'react-native'
import * as Notifications from 'expo-notifications'
import { AuthProvider } from '@/contexts/auth'

console.log(process.env.EXPO_PUBLIC_API_URL)

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

function NotificationObserver() {
  const router = useRouter()
  const lastResponse = Notifications.useLastNotificationResponse()
  const handledResponseId = useRef<string | null>(null)

  useEffect(() => {
    if (
      lastResponse &&
      lastResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER &&
      lastResponse.notification.request.identifier !== handledResponseId.current
    ) {
      handledResponseId.current = lastResponse.notification.request.identifier
      const data = lastResponse.notification.request.content.data
      const type = data?.type
      const url = data?.url

      if (url) {
        router.push(url as any)
      } else if (type === 'QUESTIONNAIRE') {
        router.push('/(questionnaires)')
      } else if (type === 'SENSOR') {
        router.push('/(sensor)' as any)
      }
    }
  }, [lastResponse, router])

  return null
}

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    "primary": "rgb(0, 99, 153)",
    "onPrimary": "rgb(255, 255, 255)",
    "primaryContainer": "rgb(205, 229, 255)",
    "onPrimaryContainer": "rgb(0, 29, 50)",
    "secondary": "rgb(0, 99, 153)",
    "onSecondary": "rgb(255, 255, 255)",
    "secondaryContainer": "rgb(205, 229, 255)",
    "onSecondaryContainer": "rgb(0, 29, 50)",
    "tertiary": "rgb(135, 82, 0)",
    "onTertiary": "rgb(255, 255, 255)",
    "tertiaryContainer": "rgb(255, 221, 186)",
    "onTertiaryContainer": "rgb(43, 23, 0)",
    "error": "rgb(186, 26, 26)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(255, 218, 214)",
    "onErrorContainer": "rgb(65, 0, 2)",
    "background": "rgb(252, 252, 255)",
    "onBackground": "rgb(26, 28, 30)",
    "surface": "rgb(252, 252, 255)",
    "onSurface": "rgb(26, 28, 30)",
    "surfaceVariant": "rgb(222, 227, 235)",
    "onSurfaceVariant": "rgb(66, 71, 78)",
    "outline": "rgb(114, 120, 126)",
    "outlineVariant": "rgb(194, 199, 207)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(47, 48, 51)",
    "inverseOnSurface": "rgb(240, 240, 244)",
    "inversePrimary": "rgb(148, 204, 255)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(239, 244, 250)",
      "level2": "rgb(232, 240, 247)",
      "level3": "rgb(224, 235, 244)",
      "level4": "rgb(222, 234, 243)",
      "level5": "rgb(217, 231, 241)"
    },
    "surfaceDisabled": "rgba(26, 28, 30, 0.12)",
    "onSurfaceDisabled": "rgba(26, 28, 30, 0.38)",
    "backdrop": "rgba(43, 49, 55, 0.4)"
  }
}

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    "primary": "rgb(148, 204, 255)",
    "onPrimary": "rgb(0, 51, 82)",
    "primaryContainer": "rgb(0, 74, 116)",
    "onPrimaryContainer": "rgb(205, 229, 255)",
    "secondary": "rgb(148, 204, 255)",
    "onSecondary": "rgb(0, 51, 82)",
    "secondaryContainer": "rgb(0, 74, 116)",
    "onSecondaryContainer": "rgb(205, 229, 255)",
    "tertiary": "rgb(255, 184, 112)",
    "onTertiary": "rgb(72, 43, 0)",
    "tertiaryContainer": "rgb(103, 62, 0)",
    "onTertiaryContainer": "rgb(255, 221, 186)",
    "error": "rgb(255, 180, 171)",
    "onError": "rgb(105, 0, 5)",
    "errorContainer": "rgb(147, 0, 10)",
    "onErrorContainer": "rgb(255, 218, 214)",
    "background": "rgb(26, 28, 30)",
    "onBackground": "rgb(226, 226, 230)",
    "surface": "rgb(26, 28, 30)",
    "onSurface": "rgb(226, 226, 230)",
    "surfaceVariant": "rgb(66, 71, 78)",
    "onSurfaceVariant": "rgb(194, 199, 207)",
    "outline": "rgb(140, 147, 155)",
    "outlineVariant": "rgb(66, 71, 78)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(226, 226, 230)",
    "inverseOnSurface": "rgb(47, 48, 51)",
    "inversePrimary": "rgb(0, 99, 153)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(32, 35, 38)",
      "level2": "rgb(36, 40, 44)",
      "level3": "rgb(40, 44, 49)",
      "level4": "rgb(42, 46, 51)",
      "level5": "rgb(45, 50, 55)"
    },
    "surfaceDisabled": "rgba(226, 226, 230, 0.12)",
    "onSurfaceDisabled": "rgba(226, 226, 230, 0.38)",
    "backdrop": "rgba(43, 49, 55, 0.4)"
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NotificationObserver />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </PaperProvider>
  )
}
