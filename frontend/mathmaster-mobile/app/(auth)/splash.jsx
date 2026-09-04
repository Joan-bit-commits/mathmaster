import { router } from 'expo-router';
import React, { useEffect } from 'react';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedBackground from '../../src/components/ui/AnimatedBackground';
import AnimatedLogo from '../../src/components/ui/AnimatedLogo';

export default function SplashScreen() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    const t = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) });
      setTimeout(() => router.replace('/(auth)/onboarding'), 420);
    }, 1600);
    return () => clearTimeout(t);
  }, [opacity]);

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