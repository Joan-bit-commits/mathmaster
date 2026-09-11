import React from 'react';
import { Pressable, Text, View } from 'react-native';

import ProgressBar from './ProgressBar';

// Same three-hue cycle as SubjectTile, kept consistent across the app.
const ACCENTS = [
  { spine: '#006591', tint: '#c9e6ff', text: '#003751' },
  { spine: '#4648d4', tint: '#e1e0ff', text: '#07006c' },
  { spine: '#855300', tint: '#ffddb8', text: '#4a2c00' },
];

/** Full-width topic row — colored spine + progress, used for browse/search lists. */
export default function TopicListItem({ topic, index = 0, onPress }) {
  const accent = ACCENTS[index % ACCENTS.length];
  const progress = topic.progress || 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Topic ${topic.name}, ${progress}% complete`}
      className="flex-row bg-surface-container-lowest rounded-2xl shadow-level-1 overflow-hidden active:opacity-90"
    >
      <View style={{ width: 4, backgroundColor: accent.spine }} />
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: accent.tint }}>
            <Text className="text-[11px] leading-4 font-semibold" style={{ color: accent.text }}>
              {topic.level}
            </Text>
          </View>
          {progress === 100 && (
            <View className="flex-row items-center gap-1">
              <Text className="text-[12px]">✅</Text>
              <Text className="font-label-sm text-label-sm text-success">Complete</Text>
            </View>
          )}
        </View>
        <Text className="text-[17px] leading-6 font-semibold text-on-surface mb-1">{topic.name}</Text>
        {!!topic.description && (
          <Text className="font-body-sm text-body-sm text-on-surface-variant mb-3" numberOfLines={2}>
            {topic.description}
          </Text>
        )}
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <ProgressBar value={progress} />
          </View>
          <Text className="font-label-sm text-label-sm text-on-surface-variant">{progress}%</Text>
        </View>
      </View>
    </Pressable>
  );
}