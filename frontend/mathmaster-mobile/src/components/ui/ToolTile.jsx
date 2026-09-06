import React from 'react';
import { Pressable, Text, View } from 'react-native';

import MaterialIcon from './MaterialIcon';

const ACCENTS = [
  { bg: '#c9e6ff', fg: '#003751', spine: '#006591' },
  { bg: '#e1e0ff', fg: '#07006c', spine: '#4648d4' },
  { bg: '#ffddb8', fg: '#4a2c00', spine: '#855300' },
];

/** Content-creation entry point — colored spine matches SubjectTile's language. */
export default function ToolTile({ icon, label, blurb, index = 0, onPress }) {
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row bg-surface-container-lowest rounded-2xl shadow-level-1 overflow-hidden mb-3 active:opacity-90"
    >
      <View style={{ width: 4, backgroundColor: accent.spine }} />
      <View className="flex-1 flex-row items-center gap-4 px-4 py-3.5">
        <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: accent.bg }}>
          <MaterialIcon name={icon} size={22} color={accent.fg} />
        </View>
        <View className="flex-1">
          <Text className="text-[17px] leading-6 font-semibold text-on-surface">{label}</Text>
          <Text className="font-body-sm text-body-sm text-on-surface-variant">{blurb}</Text>
        </View>
        <MaterialIcon name="chevron_right" size={20} color="on-surface-variant" />
      </View>
    </Pressable>
  );
}