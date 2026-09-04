import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '../global.css';
import { queryClient } from '../src/lib/queryClient';
import { rehydrateAuth, useAuthStore } from '../src/stores/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Root layout.
 *
 * IMPORTANT: the <Stack> navigator must ALWAYS stay mounted. Unmounting it
 * (e.g. showing a spinner in its place while state settles) leaves mounted
 * screens without a navigation context — any interaction on them throws
 * "Couldn't find a navigation context".
 *
 * The auth redirect is an imperative router.replace fired once (guarded by a
 * ref) after rehydration + fonts + navigator readiness — never a render-time
 * <Redirect>, which re-fires on every render and loops.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_400Regular,
    HankenGrotesk_600SemiBold: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_700Bold,
  });

  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const [rehydrated, setRehydrated] = React.useState(false);
  useEffect(() => {
    rehydrateAuth().finally(() => setRehydrated(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  const didNavigate = useRef(false);
  useEffect(() => {
    if (didNavigate.current) return;
    if (!rehydrated || !fontsLoaded || !navigationState?.key) return;
    didNavigate.current = true;
    if (isAuthenticated && user) {
      router.replace(user.role === 'teacher' ? '/(teacher)' : '/(student)');
    } else {
      router.replace('/(auth)/splash');
    }
  }, [rehydrated, fontsLoaded, navigationState?.key, isAuthenticated, user, router]);

  // The navigator is ALWAYS mounted; the spinner overlays it while booting.
  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(teacher)" />
            <Stack.Screen name="(shared)" />
          </Stack>
          {(!fontsLoaded || !rehydrated || !navigationState?.key) && (
            <View
              pointerEvents="auto"
              style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9ff' }}
            >
              <ActivityIndicator size="large" color="#006591" />
            </View>
          )}
        </SafeAreaProvider>
      </QueryClientProvider>
    </KeyboardProvider>
  );
}
