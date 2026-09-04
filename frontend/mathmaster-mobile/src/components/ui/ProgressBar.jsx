import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/** Animated progress bar (0-100). */
export default function ProgressBar({ value = 0, className = '' }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(Math.min(Math.max(value, 0), 100), { duration: 600 });
  }, [value, width]);
  const animatedStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  return (
    <View
      className={`h-2 bg-[#d3e4fe] rounded-full overflow-hidden ${className}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: value }}
    >
      <Animated.View className="h-full bg-primary rounded-full" style={animatedStyle} />
    </View>
  );
}
