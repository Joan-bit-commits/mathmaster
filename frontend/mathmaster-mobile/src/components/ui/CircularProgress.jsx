import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const SIZE = 140;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

/** Animated circular mastery ring (0-100). */
export default function CircularProgress({ value = 0, label }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.min(Math.max(value, 0), 100) / 100, { duration: 900 });
  }, [value, progress]);
  const animatedProps = useAnimatedStyle(() => ({ strokeDashoffset: C * (1 - progress.value) }));

  return (
    <View className="items-center justify-center" accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: value }} accessibilityLabel={label || `${value}% mastery`}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="#6e7881" strokeOpacity={0.2} strokeWidth={STROKE} fill="none" />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="#006591"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${C} ${C}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-[32px] leading-10 font-bold text-on-surface" accessibilityLiveRegion="polite">
          {Math.round(value)}%
        </Text>
        {label ? <Text className="font-label-sm text-label-sm text-on-surface-variant">{label}</Text> : null}
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
