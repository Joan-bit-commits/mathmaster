import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const TONES = {
  primary: 'bg-[#c9e6ff] text-[#001e2f]',
  secondary: 'bg-[#e1e0ff] text-[#07006c]',
  tertiary: 'bg-[#ffddb8] text-[#2a1700]',
  success: 'bg-[#c8e6c9] text-[#1b5e20]',
  warning: 'bg-[#ffe0b2] text-[#7a4f00]',
  error: 'bg-[#ffdad6] text-[#93000a]',
  neutral: 'bg-[#dce9ff] text-[#3e4850]',
};

/** Rounded status chip. Tones: primary | secondary | tertiary | success | warning | error | neutral */
export default function Chip({ tone = 'neutral', label, selected = false, onPress, accessibilityLabel }) {
  const activeTone = TONES[selected ? 'primary' : tone] || TONES.neutral;
  const [bgClass, textClass] = activeTone.split(' ');

  const content = <Text className={`font-label-sm text-label-sm px-3 py-1 ${textClass}`}>{label}</Text>;

  if (!onPress) {
    return (
      <View className={`rounded-full self-start overflow-hidden ${bgClass}`} accessibilityLabel={accessibilityLabel || label}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected }}
      className={`rounded-full overflow-hidden active:opacity-80 ${bgClass} ${selected ? 'border-[1.5px] border-primary' : ''}`}
    >
      {content}
    </Pressable>
  );
}