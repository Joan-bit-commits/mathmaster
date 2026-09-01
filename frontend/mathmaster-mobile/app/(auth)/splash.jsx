import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Splash → onboarding after 1.5s with fade-out.
export default function SplashScreen() {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.4)) });
    const t = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 });
      setTimeout(() => router.replace('/(auth)/onboarding'), 420);
    }, 1500);
    return () => clearTimeout(t);
  }, [opacity, scale]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <SafeAreaView className="flex-1 bg-primary items-center justify-center" accessibilityLabel="MathMaster splash">
      <Animated.View style={style} className="items-center">
        <Text className="text-6xl mb-4">📐</Text>
        <Text className="text-[32px] leading-10 font-bold text-white tracking-tight">MathMaster</Text>
        <Text className="font-body-md text-body-md text-[#89ceff] mt-2">Master math. Unlock your future.</Text>
      </Animated.View>
    </SafeAreaView>
  );
}
