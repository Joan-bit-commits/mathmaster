import React from 'react';
import { Pressable, Text, View } from 'react-native';

import ProgressBar from './ProgressBar';

// Cycles through the three brand hues so subjects read as coded, not uniform.
const ACCENTS = [
  { spine: '#006591', tint: '#c9e6ff', text: '#003751' },   // primary
  { spine: '#4648d4', tint: '#e1e0ff', text: '#07006c' },   // secondary
  { spine: '#855300', tint: '#ffddb8', text: '#4a2c00' },   // tertiary
];

/** Notebook-tab style subject card — colored spine on the leading edge. */
export default function SubjectTile({ name, level, progress = 0, index = 0, onPress }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Subject ${name}, ${progress}% complete`}
      accessibilityHint="Tap to view subject details"
      className="w-44 bg-surface-container-lowest rounded-2xl shadow-level-1 overflow-hidden active:opacity-90"
    >
      <View className="flex-row">
        <View style={{ width: 5, backgroundColor: accent.spine }} />
        <View className="flex-1 p-4">
          <View
            className="self-start rounded-full px-2 py-0.5 mb-2"
            style={{ backgroundColor: accent.tint }}
          >
            <Text className="text-[11px] leading-4 font-semibold" style={{ color: accent.text }}>
              {level}
            </Text>
          </View>
          <Text className="text-[17px] leading-6 font-semibold text-on-surface mb-3" numberOfLines={2}>
            {name}
          </Text>
          <ProgressBar value={progress} />
          <Text className="font-label-sm text-label-sm text-on-surface-variant mt-2">{progress}% complete</Text>
        </View>
      </View>
    </Pressable>
  );
}