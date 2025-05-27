import React from 'react';
import { useState } from 'react';
import { View } from 'react-native';
import { BottomNavigation, Text, Provider, Icon } from 'react-native-paper';
import { Link } from 'expo-router';
function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
      <Link href="/">Retour</Link>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
  </View>
  );
}

export default function MyComponent() {
  const [index, setIndex] = useState(0);

  const routes = [
    { key: 'home', title: 'Home', icon: 'home' },
    { key: 'account', title: 'Mon compte', icon: 'account' },
    { key: 'settings', title: 'Settings', icon: 'cog' },
  ];

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'home':
        return <HomeScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return null;
    }
  };

  return (
    <Provider>
      {renderScene({ route: routes[index] })}
      <BottomNavigation.Bar
        navigationState={{ index, routes }}
        onTabPress={({ route }) => {
          const newIndex = routes.findIndex((r) => r.key === route.key);
          if (newIndex !== -1) {
            setIndex(newIndex);
          }
        }}
        renderIcon={({ route, color }) => (
          <Icon source={route.icon} size={24} color={color} />
        )}
        getLabelText={({ route }) => route.title}
      />
    </Provider>
  );
}