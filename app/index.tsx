import React from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

export default function Home() {
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Redirect href="/(auth)/login" />
    </View>
  );
}
