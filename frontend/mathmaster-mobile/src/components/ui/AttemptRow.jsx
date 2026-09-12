import React from 'react';
import { Text, View } from 'react-native';

import MaterialIcon from './MaterialIcon';

function statusFor(score) {
  if (score >= 70) return { color: '#2e7d32', bg: '#c8e6c9', icon: 'check_circle' };
  if (score >= 50) return { color: '#b26a00', bg: '#ffe0b2', icon: 'error' };
  return { color: '#ba1a1a', bg: '#ffdad6', icon: 'cancel' };
}

/** Recent quiz attempt row — borderless, colored badge instead of plain score text. */
export default function AttemptRow({ title, score, date }) {
  const status = statusFor(score);
  return (
    <View className="flex-row items-center gap-3 bg-surface-container-lowest rounded-2xl px-4 py-3 mb-2 shadow-level-1">
      <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: status.bg }}>
        <MaterialIcon name={status.icon} size={16} color={status.color} />
      </View>
      <View className="flex-1">
        <Text className="font-body-md text-body-md text-on-surface">{title}</Text>
        <Text className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{date}</Text>
      </View>
      <Text className="text-[17px] font-bold" style={{ color: status.color }}>
        {score}%
      </Text>
    </View>
  );
}