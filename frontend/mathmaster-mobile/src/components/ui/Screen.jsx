import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/** Screen-enter wrapper: 300ms fade + slide-up. */
export default function Screen({ children, className = '' }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
  }, [opacity, translateY]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}
