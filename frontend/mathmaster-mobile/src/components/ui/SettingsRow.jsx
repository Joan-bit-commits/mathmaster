import React from 'react';
import { Pressable, Text, View } from 'react-native';

import MaterialIcon from './MaterialIcon';

/** Borderless settings/menu row — icon chip, label, chevron. */
export default function SettingsRow({ icon, label, tint = '#eff4ff', iconColor = 'primary', onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-surface-container-low"
    >
      <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: tint }}>
        <MaterialIcon name={icon} size={18} color={iconColor} />
      </View>
      <Text className="flex-1 font-body-md text-body-md text-on-surface">{label}</Text>
      <MaterialIcon name="chevron_right" size={20} color="outline" />
    </Pressable>
  );
}