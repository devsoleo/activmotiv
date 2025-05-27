import { SessionProvider } from '@/contexts/auth';
import { Slot } from 'expo-router';
import React from 'react';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <SessionProvider>
        <Slot />
      </SessionProvider>
    </PaperProvider>
  );
}
