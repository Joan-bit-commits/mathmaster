import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

/** Shimmer skeleton. Variants: text | circle | card */
export default function LoadingSkeleton({ variant = 'text', className = '' }) {
  const x = useSharedValue(-1);
  useEffect(() => {
    x.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
  }, [x]);
  const shimmer = useAnimatedStyle(() => ({ opacity: 0.5 + 0.5 * (x.value + 1) / 2 }));

  const shape =
    variant === 'circle'
      ? 'rounded-full w-12 h-12'
      : variant === 'card'
        ? 'h-32 w-full rounded-2xl'
        : 'h-4 w-full rounded-lg';

  return (
    <Animated.View
      style={shimmer}
      className={`bg-[#d3e4fe] overflow-hidden ${shape} ${className}`}
      accessibilityLabel="Loading"
    />
  );
}
