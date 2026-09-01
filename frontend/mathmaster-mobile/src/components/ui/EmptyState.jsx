import React from 'react';
import { Text, View } from 'react-native';

import Button from './Button';
import MaterialIcon from './MaterialIcon';

/** Warm empty state with a single clear CTA. */
export default function EmptyState({ icon = 'search', title, description, actionLabel, onAction }) {
  return (
    <View className="items-center justify-center py-12 px-6" accessibilityLiveRegion="polite">
      <View className="w-20 h-20 rounded-full bg-surface-container-low items-center justify-center mb-4">
        <MaterialIcon name={icon} size={40} color="outline" />
      </View>
      <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface text-center mb-1">
        {title}
      </Text>
      {description ? (
        <Text className="font-body-sm text-body-sm text-on-surface-variant text-center mb-6">{description}</Text>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
