import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initLocalDb } from '@/lib/sqlite';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    // Inicializar SQLite local
    initLocalDb().catch((err) => console.error('Error inicializando SQLite:', err));
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="detalle/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="configuracion"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="venta/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="descartar/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
