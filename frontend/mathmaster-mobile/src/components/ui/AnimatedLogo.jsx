import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function AnimatedLogo({ emoji = '📐', size = 96, delay = 0 }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300, delay });
    scale.value = withTiming(1, { duration: 600, delay, easing: Easing.out(Easing.back(1.6)) });
  }, [opacity, scale, delay]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[style, { width: size, height: size, borderRadius: size / 2 }]} className="bg-white/15 items-center justify-center">
      <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
    </Animated.View>
  );
}