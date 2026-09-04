import React from 'react';
import { Text, View } from 'react-native';

import MaterialIcon from './MaterialIcon';

/** Stat tile: icon + uppercase label, big value, caption. */
export default function StatTile({ icon, label, value, caption, iconColor = 'primary' }) {
  return (
    <View
      className="bg-surface-container-lowest rounded-2xl p-4 border border-[#d3e4fe]/50 flex-1"
      accessibilityLabel={`${label}: ${value}`}
    >
      <View className="flex-row items-center gap-1 mb-2">
        {icon ? <MaterialIcon name={icon} size={18} color={iconColor} /> : null}
        <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase">{label}</Text>
      </View>
      <Text className="text-[32px] leading-[40px] font-bold text-on-surface">{value}</Text>
      {caption ? <Text className="font-body-sm text-body-sm text-on-surface-variant mt-1">{caption}</Text> : null}
    </View>
  );
}
