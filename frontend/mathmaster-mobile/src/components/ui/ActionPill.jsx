import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text } from 'react-native';

import MaterialIcon from './MaterialIcon';

/** Horizontal-scroll quick-action pill — icon + label, tinted by accent. */
export default function ActionPill({ icon, label, tint, iconColor, onPress }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center gap-2 rounded-full px-4 py-2.5 mr-2 active:opacity-80"
      style={{ backgroundColor: tint }}
    >
      <MaterialIcon name={icon} size={18} color={iconColor} />
      <Text className="font-label-sm text-label-sm" style={{ color: iconColor }}>
        {label}
      </Text>
    </Pressable>
  );
}