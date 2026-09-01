import React from 'react';
import { Text, View } from 'react-native';

import Button from './Button';
import MaterialIcon from './MaterialIcon';

/** Error state with retry CTA. */
export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <View className="items-center justify-center py-12 px-6" accessibilityLiveRegion="polite">
      <View className="w-20 h-20 rounded-full bg-[#ffdad6] items-center justify-center mb-4">
        <MaterialIcon name="error_outline" size={40} color="error" />
      </View>
      <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface text-center mb-1">
        {title}
      </Text>
      {description ? (
        <Text className="font-body-sm text-body-sm text-on-surface-variant text-center mb-6">{description}</Text>
      ) : null}
      {onRetry ? <Button label="Try again" onPress={onRetry} icon="refresh" /> : null}
    </View>
  );
}
