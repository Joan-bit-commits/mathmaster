import React from 'react';
import { Text, View } from 'react-native';

export default function LocalContextPill({ label, className = '' }) {
  if (!label) return null;
  return <View className={`self-start rounded-full bg-tertiary-fixed px-3 py-1 ${className}`} accessibilityLabel={label}><Text className="font-label-sm text-on-tertiary-fixed">{label}</Text></View>;
}