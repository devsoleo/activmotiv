import { Slot } from 'expo-router'
import { PaperProvider } from 'react-native-paper'

import { AuthProvider } from '@/contexts/auth'

console.log(process.env.EXPO_PUBLIC_API_URL)

const theme = {
  "colors": {
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

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </PaperProvider>
  )
}
