import { useState } from 'react'
import { BottomNavigation, Icon } from 'react-native-paper'

import SettingsScreen from "./settings"
import TrackingScreen from "./tracking"

export default function Home() {
  const [index, setIndex] = useState(0)

  const [routes] = useState([
    { key: 'tracking', title: 'Mon suivi', icon: 'clipboard-text-outline' },
    { key: 'settings', title: 'Paramètres', icon: 'cog-outline' },
  ])

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'tracking':
        return <TrackingScreen active={index === 0} />
      case 'settings':
        return <SettingsScreen />
      default:
        return null
    }
  }

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderIcon={({ route, color }) => (
        <Icon source={route.icon} size={24} color={color} />
      )}
      getLabelText={({ route }) => route.title}
      renderScene={renderScene}
    />
  )
}
