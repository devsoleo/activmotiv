import { useState } from 'react'
import { BottomNavigation, Icon } from 'react-native-paper'

import SettingsScreen from "./settings"
import TrackingScreen from "./tracking"

export default function Home() {
  const [index, setIndex] = useState(0)

  const [routes] = useState([
    { key: 'tracking', title: 'Suivi', icon: 'clipboard-text-outline' },
    { key: 'settings', title: 'Paramètres', icon: 'cog-outline' },
  ])

  const [scenes] = useState<Record<string, React.ReactNode>>({
    tracking: <TrackingScreen />,
    settings: <SettingsScreen />
  })

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderIcon={({ route, color }) => (
        <Icon source={route.icon} size={24} color={color} />
      )}
      getLabelText={({ route }) => route.title}
      renderScene={({ route }) => scenes[route.key]}
    />
  )
}
