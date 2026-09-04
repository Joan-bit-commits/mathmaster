import React from 'react';
import { Pressable, Text, View } from 'react-native';

/** Section wrapper with optional header + right-side action link. */
export default function Section({ title, actionLabel, onAction, children, className = '' }) {
  return (
    <View className={`mb-8 ${className}`}>
      {title ? (
        <View className="flex-row items-center justify-between mb-2">
          <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface">
            {title}
          </Text>
          {actionLabel ? (
            <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel}>
              <Text className="font-label-sm text-label-sm text-primary">{actionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
