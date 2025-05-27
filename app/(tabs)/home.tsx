import { Redirect } from 'expo-router';
import React from 'react';
import { useState } from 'react';
import { View } from 'react-native';
import { BottomNavigation, Text, Provider, Icon, TouchableRipple, Divider, Card } from 'react-native-paper';
import { useSession } from '@/contexts/auth'

function HomeScreen() {
  return (
    <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', paddingTop: 40 }}>
      <Card style={{ width: "44%", margin: 10 }} >
        <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
      </Card>
      <Card style={{ width: "44%", margin: 10 }} >
        <Card.Cover source={{ uri: 'https://picsum.photos/701' }} />
      </Card>
      <Card style={{ width: "44%", margin: 10 }} >
        <Card.Cover source={{ uri: 'https://picsum.photos/702' }} />
      </Card>
    </View>
  );
}

function AccountScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

function SettingsScreen() {
  const { signOut } = useSession()

  return (
    <View style={{ flex: 1}}>
        <Text variant="headlineLarge" style={{ textAlign: 'center', paddingTop: 45, paddingBottom: 15 }}>Paramètres</Text>

        <TouchableRipple
            onPress={() => {}}
            rippleColor="rgba(0, 0, 0, .06)"
          >
            <Text variant="titleMedium" style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 15 }}>Informations étude</Text>
          </TouchableRipple>
        <Divider />
          <TouchableRipple
            onPress={() => {}}
            rippleColor="rgba(0, 0, 0, .06)"
          >
            <Text variant="titleMedium" style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 15 }}>Contacts</Text>
          </TouchableRipple>
        <Divider />
          <TouchableRipple
            onPress={() => {}}
            rippleColor="rgba(0, 0, 0, .06)"
          >
            <Text variant="titleMedium" style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 15 }}>Licences Open-source</Text>
          </TouchableRipple>
        <Divider />
          <TouchableRipple
            onPress={() => console.log('Pressed')}
            rippleColor="rgba(255, 0, 0, .06)"
          >
            <Text variant="titleMedium" style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 15 }} onPress={signOut} >Se déconnecter</Text>
          </TouchableRipple>
    </View>
  );
}

export default function MyComponent() {
  const [index, setIndex] = useState(0);

  const routes = [
    { key: 'home', title: 'Accueil', icon: 'home' },
    { key: 'account', title: 'Suivi', icon: 'map-marker' },
    { key: 'settings', title: 'Paramètres', icon: 'cog' },
  ];

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'home':
        return <HomeScreen />;
      case 'account':
        return <AccountScreen />;
      case 'settings':
        return <SettingsScreen />;
        // return <Redirect href="./settings" />;
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