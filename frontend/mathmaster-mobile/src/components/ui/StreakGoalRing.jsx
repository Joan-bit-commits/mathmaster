import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const SIZE = 56;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Compact daily-goal ring — e.g. "3 of 5 lessons today". */
export default function StreakGoalRing({ completed = 0, goal = 5 }) {
  const progress = Math.min(completed / Math.max(goal, 1), 1);
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <View className="items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#dce9ff"
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#006591"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-[13px] leading-4 font-bold text-primary">{completed}</Text>
        <Text className="text-[9px] leading-3 text-on-surface-variant">of {goal}</Text>
      </View>
    </View>
  );
}