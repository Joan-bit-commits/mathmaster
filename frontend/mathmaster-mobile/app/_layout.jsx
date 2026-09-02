import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import { queryClient } from '../src/lib/queryClient';
import { rehydrateAuth, useAuthStore } from '../src/stores/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Root layout.
 *
 * Routing is done with an imperative router.replace inside an effect (not a
 * <Redirect> in render) — a render-time Redirect from the root layout re-fires
 * on every render pass and causes "Maximum update depth exceeded".
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_400Regular,
    HankenGrotesk_600SemiBold: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_700Bold,
  });

  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const [rehydrated, setRehydrated] = React.useState(false);
  useEffect(() => {
    rehydrateAuth().finally(() => setRehydrated(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  // Navigate once, after (a) store rehydration, (b) fonts, (c) navigator ready.
  const target = isAuthenticated && user
    ? user.role === 'teacher' ? '/(teacher)' : '/(student)'
    : null;

  useEffect(() => {
    if (!rehydrated || !fontsLoaded || !navigationState?.key) return;
    if (target) {
      router.replace(target);
    } else if (!isAuthenticated) {
      // Only push into the auth flow once per cold start; the auth group's own
      // splash screen takes it from there.
      router.replace('/(auth)/splash');
    }
  }, [rehydrated, fontsLoaded, navigationState?.key, target, isAuthenticated, router]);

  if (!fontsLoaded || !rehydrated || !navigationState?.key) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9ff' }}>
        <ActivityIndicator size="large" color="#006591" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(student)" />
          <Stack.Screen name="(teacher)" />
          <Stack.Screen name="(shared)" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
