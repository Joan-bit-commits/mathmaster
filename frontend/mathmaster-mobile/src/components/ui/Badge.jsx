import React from 'react';
import { Text, View } from 'react-native';

const TONES = {
  success: 'bg-[#d88a00]',
  warning: 'bg-[#ffb95f]',
  error: 'bg-[#ba1a1a]',
  info: 'bg-[#0ea5e9]',
  neutral: 'bg-[#6e7881]',
};

const TEXT_TONES = {
  success: 'text-on-tertiary',
  warning: 'text-on-tertiary',
  error: 'text-on-error',
  info: 'text-on-primary',
  neutral: 'text-on-primary',
};

/** Small uppercase badge. Tones: success | warning | error | info | neutral */
export default function Badge({ tone = 'info', label }) {
  return (
    <View className={`rounded-full px-2 py-0.5 self-start ${TONES[tone]}`} accessibilityLabel={label}>
      <Text className={`text-[10px] font-label-sm uppercase tracking-widest ${TEXT_TONES[tone]}`}>{label}</Text>
    </View>
  );
}
