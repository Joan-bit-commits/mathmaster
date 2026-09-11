import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '../global.css';
import BrandedSplash from '../src/components/ui/BrandedSplash';
import { queryClient } from '../src/lib/queryClient';
import { rehydrateAuth, useAuthStore } from '../src/stores/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_VISIBLE_MS = 1600;
const FADE_MS = 400;
// Safety net: if auth rehydration hasn't resolved by this point (a hung
// AsyncStorage read, etc.), stop waiting rather than leaving the user
// stuck on the splash screen forever.
const HYDRATION_TIMEOUT_MS = 5000;

/**
 * Root layout.
 *
 * IMPORTANT: the <Stack> navigator must ALWAYS stay mounted. Unmounting it
 * (e.g. showing a spinner in its place while state settles) leaves mounted
 * screens without a navigation context — any interaction on them throws
 * "Couldn't find a navigation context".
 *
 * The branded splash used to be its own route (/(auth)/splash): RootLayout
 * did one router.replace() to it, then that screen did a SECOND
 * router.replace() to the real destination once ready — crossing from the
 * (auth) group into (student)/(teacher). That fixed "the dashboard flashes
 * before the splash" (see the previous version of this comment), but
 * traded it for a subtler bug: whether a `replace()` across group
 * boundaries inside a nested navigator leaves the ROOT stack with a single
 * clean history entry, or a stray one still pointing at the splash/auth
 * group, isn't something worth gambling on per Expo Router version — and
 * in practice, back navigation on some screens was landing users back on
 * the splash screen instead of exiting/doing nothing.
 *
 * Fixed by removing the second hop entirely: the branded splash is now
 * rendered INLINE here as a plain overlay (not a route) while this layout
 * waits for fonts, the navigator, auth rehydration, and a minimum
 * branded-display timer — then it issues exactly ONE router.replace()
 * straight to the real destination. One navigation event ever means one
 * history entry, and nothing to accidentally navigate "back" to.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_400Regular,
    HankenGrotesk_600SemiBold: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold: require('@expo-google-fonts/hanken-grotesk').HankenGrotesk_700Bold,
  });

  const router = useRouter();
  const navigationState = useRootNavigationState();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    rehydrateAuth();
  }, []);

  const [minElapsed, setMinElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const minTimer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const hardTimer = setTimeout(() => setTimedOut(true), HYDRATION_TIMEOUT_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(hardTimer);
    };
  }, []);

  const ready = fontsLoaded && !!navigationState?.key && minElapsed && (isHydrated || timedOut);

  const didNavigate = useRef(false);
  useEffect(() => {
    if (didNavigate.current || !ready) return;
    didNavigate.current = true;
    setFading(true);
    const t = setTimeout(() => {
      if (isAuthenticated && user) {
        router.replace(user.role === 'teacher' ? '/(teacher)' : '/(student)');
      } else {
        router.replace('/(auth)/onboarding');
      }
      // Hide the native splash only once this redirect has been issued —
      // hiding it any earlier can reveal the Stack's default route for a
      // frame before the redirect actually lands.
      SplashScreen.hideAsync().catch(() => {});
      setShowOverlay(false);
    }, FADE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // The navigator is ALWAYS mounted; the branded splash overlays it while booting.
  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack initialRouteName="(auth)" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(teacher)" />
            <Stack.Screen name="(shared)" />
          </Stack>
          {showOverlay && (
            <View pointerEvents="auto" style={{ position: 'absolute', inset: 0 }}>
              <BrandedSplash fading={fading} />
            </View>
          )}
        </SafeAreaProvider>
      </QueryClientProvider>
    </KeyboardProvider>
  );
}