import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ModeTabs({ value, onChange, options = ['Chat', 'Scan', 'Doc'], className = '' }) {
  return <View className={`flex-row rounded-2xl bg-surface-container p-1 ${className}`} accessibilityLabel="Mode selector">{options.map((option) => <Pressable key={option} onPress={() => onChange(option)} className={`flex-1 items-center rounded-xl px-3 py-2 ${value === option ? 'bg-surface-container-lowest shadow-level-1' : ''}`} accessibilityRole="tab" accessibilityState={{ selected: value === option }}><Text className={`font-label-sm ${value === option ? 'text-primary' : 'text-on-surface-variant'}`}>{option}</Text></Pressable>)}</View>;
}