import React from 'react';
import { Text, View } from 'react-native';

import MaterialIcon from './MaterialIcon';

const TINTS = {
  primary: { bg: '#c9e6ff', fg: '#003751' },
  secondary: { bg: '#e1e0ff', fg: '#07006c' },
  error: { bg: '#ffdad6', fg: '#93000a' },
};

/** Borderless summary tile — icon chip + value, tinted by accent. */
export default function StatCard({ icon, label, value, tone = 'primary' }) {
  const tint = TINTS[tone] || TINTS.primary;
  return (
    <View className="flex-1 bg-surface-container-lowest rounded-2xl p-3 shadow-level-1">
      <View className="w-8 h-8 rounded-full items-center justify-center mb-2" style={{ backgroundColor: tint.bg }}>
        <MaterialIcon name={icon} size={16} color={tint.fg} />
      </View>
      <Text className="text-[20px] leading-7 font-bold text-on-surface">{value}</Text>
      <Text className="font-label-sm text-label-sm text-on-surface-variant">{label}</Text>
    </View>
  );
}