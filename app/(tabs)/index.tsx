import { useState } from 'react'
import { BottomNavigation, Icon } from 'react-native-paper'

import SettingsScreen from "./settings"
import TrackingScreen from "./tracking"
import HomeScreen from './home'

export default function Home() {
  const [index, setIndex] = useState(0)

  const routes = [
    { key: 'home', title: 'Accueil', icon: 'home' },
    { key: 'tracking', title: 'Suivi', icon: 'map-marker' },
    { key: 'settings', title: 'Paramètres', icon: 'cog' },
  ]

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'home':
        return <HomeScreen />
      case 'tracking':
        return <TrackingScreen />
      case 'settings':
        return <SettingsScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <>
      {renderScene({ route: routes[index] })}
      <BottomNavigation.Bar
        navigationState={{ index, routes }}
        onTabPress={({ route }) => {
          const newIndex = routes.findIndex((r) => r.key === route.key)
          if (newIndex !== -1) {
            setIndex(newIndex)
          }
        }}
        renderIcon={({ route, color }) => (
          <Icon source={route.icon} size={24} color={color} />
        )}
        getLabelText={({ route }) => route.title}
      />
    </>
  )
}