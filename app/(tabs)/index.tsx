import { useState } from 'react'
import { BottomNavigation, Icon } from 'react-native-paper'

import SettingsScreen from "./settings"
import TrackingScreen from "./tracking"
import HomeScreen from './home'

export default function Home() {
  const [index, setIndex] = useState(0)

  const [routes] = useState([
    { key: 'home', title: 'Accueil', icon: 'home' },
    { key: 'tracking', title: 'Suivi', icon: 'map-marker' },
    { key: 'settings', title: 'Paramètres', icon: 'cog' },
  ])

  const [scenes] = useState({
    home: <HomeScreen />,
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