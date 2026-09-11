import React from 'react';
import { Text, View } from 'react-native';

import ProgressBar from './ProgressBar';

const ACCENTS = ['#006591', '#4648d4', '#855300'];

/** Topic mastery row — colored dot ties back to SubjectTile's accent cycle. */
export default function TopicMasteryRow({ name, score, index = 0 }) {
  const color = ACCENTS[index % ACCENTS.length];
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <Text className="font-body-sm text-body-sm text-on-surface">{name}</Text>
        </View>
        <Text className="font-label-sm text-label-sm text-on-surface-variant">{score}%</Text>
      </View>
      <ProgressBar value={score} />
    </View>
  );
}