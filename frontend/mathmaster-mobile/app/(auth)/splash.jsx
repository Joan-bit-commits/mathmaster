import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedBackground from '../../src/components/ui/AnimatedBackground';
import AnimatedLogo from '../../src/components/ui/AnimatedLogo';
import { useAuthStore } from '../../src/stores/authStore';

const MIN_VISIBLE_MS = 1600;
const FADE_MS = 400;
// Safety net: if auth rehydration hasn't resolved by this point (a hung
// AsyncStorage read, etc.), stop waiting rather than leaving the user
// stuck on the splash screen forever — worst case they land on
// onboarding/login and can sign back in.
const HYDRATION_TIMEOUT_MS = 5000;

export default function SplashScreen() {
  const opacity = useSharedValue(1);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [minElapsed, setMinElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const navigated = useRef(false);

  // Two independent timers: the branded minimum display time, and a hard
  // ceiling in case auth rehydration never resolves.
  useEffect(() => {
    const minTimer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const hardTimer = setTimeout(() => setTimedOut(true), HYDRATION_TIMEOUT_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(hardTimer);
    };
  }, []);

  // Navigate once BOTH the minimum display time has elapsed AND we
  // actually know the real (rehydrated) auth state — not before, or an
  // already-logged-in user would flash through onboarding/login while
  // isAuthenticated is still at its default `false`.
  useEffect(() => {
    if (navigated.current) return;
    if (!minElapsed) return;
    if (!isHydrated && !timedOut) return;
    navigated.current = true;

    opacity.value = withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.quad) });
    const t = setTimeout(() => {
      if (isAuthenticated && user) {
        router.replace(user.role === 'teacher' ? '/(teacher)' : '/(student)');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }, FADE_MS + 20);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minElapsed, isHydrated, timedOut, isAuthenticated, user]);

  const fadeOutStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <SafeAreaView className="flex-1 bg-primary items-center justify-center" accessibilityLabel="MathMaster splash">
      <AnimatedBackground colors={['#4648d4', '#0284c7']} />
      <Animated.View style={fadeOutStyle} className="items-center">
        <AnimatedLogo emoji="📐" size={104} />
        <Animated.Text entering={FadeInDown.delay(350).duration(400)} className="text-[32px] leading-10 font-bold text-white tracking-tight mt-5">
          MathMaster
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(500).duration(400)} className="font-body-md text-body-md text-[#89ceff] mt-2">
          Master math. Unlock your future.
        </Animated.Text>
      </Animated.View>
    </SafeAreaView>
  );
}
