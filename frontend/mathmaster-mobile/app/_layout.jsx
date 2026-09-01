import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import { queryClient } from '../src/lib/queryClient';
import { rehydrateAuth, useAuthStore } from '../src/stores/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGate({ children }) {
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9ff' }}>
        <ActivityIndicator size="large" color="#006591" />
      </View>
    );
  }
  if (isAuthenticated && user) {
    return <Redirect href={user.role === 'teacher' ? '/(teacher)/(tabs)' : '/(student)/(tabs)'} />;
  }
  return children;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_400Regular,
    HankenGrotesk_600SemiBold: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_700Bold,
  });

  useEffect(() => {
    rehydrateAuth().finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthGate>
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(teacher)" />
            <Stack.Screen name="(shared)" />
          </Stack>
        </AuthGate>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
