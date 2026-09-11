import React from 'react';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedBackground from './AnimatedBackground';
import AnimatedLogo from './AnimatedLogo';

const FADE_MS = 400;

/**
 * The branded boot splash — logo, app name, tagline. Presentational only;
 * the caller (RootLayout) owns all timing and navigation decisions.
 * Extracted from what used to be a standalone /(auth)/splash *route* so it
 * can be rendered inline as a plain overlay instead — see the comment in
 * app/_layout.jsx for why that matters.
 */
export default function BrandedSplash({ fading = false }) {
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (fading) {
      opacity.value = withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.quad) });
    }
  }, [fading, opacity]);

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
