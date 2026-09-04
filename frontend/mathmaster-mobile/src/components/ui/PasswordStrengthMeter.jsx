import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const LEVELS = [
  { label: 'Too short', color: '#ba1a1a' },
  { label: 'Weak', color: '#ba1a1a' },
  { label: 'Okay', color: '#d88a00' },
  { label: 'Strong', color: '#0f9d58' },
];

export default function PasswordStrengthMeter({ strength = 0 }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(strength / 3, { duration: 350 });
  }, [strength, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: LEVELS[strength]?.color || LEVELS[0].color,
  }));

  if (strength === 0) return null;

  return (
    <View className="mb-4 -mt-2" accessibilityLabel={`Password strength ${LEVELS[strength].label}`}>
      <View className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
        <Animated.View style={barStyle} className="h-full rounded-full" />
      </View>
      <Text className="font-label-sm text-label-sm text-on-surface-variant mt-1">{LEVELS[strength].label}</Text>
    </View>
  );
}