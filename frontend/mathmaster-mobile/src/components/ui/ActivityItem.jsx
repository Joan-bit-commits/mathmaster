import React from 'react';
import { Text, View } from 'react-native';

import MaterialIcon from './MaterialIcon';

/** Timeline row for a chronological activity feed — connecting line is earned by the real sequence. */
export default function ActivityItem({ icon, text, time, isLast = false }) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
          <MaterialIcon name={icon} size={16} color="primary" />
        </View>
        {!isLast && <View className="w-[1.5px] flex-1 bg-surface-variant mt-1 mb-1" />}
      </View>
      <View className="flex-1 pb-4">
        <Text className="font-body-sm text-body-sm text-on-surface">{text}</Text>
        <Text className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{time}</Text>
      </View>
    </View>
  );
}