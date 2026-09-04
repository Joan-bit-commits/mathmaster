import React from 'react';
import { View } from 'react-native';

export default function StepDots({ count, activeIndex, className = '' }) {
  return (
    <View className={`flex-row justify-center gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className={`h-2 rounded-full ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-outline-variant'}`} accessibilityLabel={`Step ${i + 1} of ${count}`} />
      ))}
    </View>
  );
}