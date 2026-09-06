import React from 'react';
import { Text, View } from 'react-native';
export default function ConfidenceIndicator({ confidence = 0, className = '' }) {
  const filled = Math.round(Math.max(0, Math.min(1, confidence)) * 5);
  return <View className={`flex-row items-center gap-1 ${className}`} accessibilityLabel={`AI confidence ${Math.round(confidence * 100)} percent`}>{[0, 1, 2, 3, 4].map((dot) => <View key={dot} className={`h-2.5 w-2.5 rounded-full ${dot < filled ? 'bg-primary' : 'bg-surface-variant'}`} />)}<Text className="ml-1 font-label-sm text-on-surface-variant">{Math.round(confidence * 100)}%</Text></View>;
}