import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View } from 'react-native';

const VARIANTS = {
  default: 'bg-surface-container-lowest border border-surface-variant/50 shadow-level-1',
  flat: 'bg-surface-container-lowest',
  hero: 'bg-inverse-surface shadow-level-3',
  outlined: 'bg-transparent border-[1.5px] border-outline-variant',
};

/** Material 3 card. Variants: default | flat | hero | outlined */
export default function Card({ variant = 'default', onPress, className = '', children, accessibilityLabel, ...rest }) {
  const content = (
    <View className={`rounded-2xl p-[20px] ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="active:opacity-90"
    >
      {content}
    </Pressable>
  );
}
