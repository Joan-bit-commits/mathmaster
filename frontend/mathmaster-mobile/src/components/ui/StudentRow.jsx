import React from 'react';
import { Pressable, Text, View } from 'react-native';

import Avatar from './Avatar';
import Sparkline from './Sparkline';
import { friendlyDate } from '../../lib/format';

function statusFor(score) {
  if (score >= 70) return { color: '#2e7d32', label: 'On track' };
  if (score >= 50) return { color: '#b26a00', label: 'Watch' };
  return { color: '#ba1a1a', label: 'At risk' };
}

/** Student roster row — colored spine encodes performance status. */
export default function StudentRow({ student, onPress }) {
  const status = statusFor(student.average_score);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Student ${student.name}, ${status.label}, ${student.average_score}%`}
      className="flex-row bg-surface-container-lowest rounded-2xl shadow-level-1 overflow-hidden active:opacity-90"
    >
      <View style={{ width: 4, backgroundColor: status.color }} />
      <View className="flex-1 flex-row items-center gap-3 px-4 py-3">
        <Avatar name={student.name} size="md" />
        <View className="flex-1">
          <Text className="text-[16px] leading-6 font-semibold text-on-surface" numberOfLines={1}>
            {student.name}
          </Text>
          <Text className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
            {student.level} · active {friendlyDate(student.last_active)}
          </Text>
        </View>
        <Sparkline values={student.trend} color={status.color} />
        <View className="items-end ml-1">
          <Text className="text-[17px] leading-6 font-bold" style={{ color: status.color }}>
            {student.average_score}%
          </Text>
          <Text className="font-label-sm text-label-sm text-on-surface-variant">{status.label}</Text>
        </View>
      </View>
    </Pressable>
  );
}