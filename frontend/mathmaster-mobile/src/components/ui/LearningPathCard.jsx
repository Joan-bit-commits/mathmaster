import React from 'react';
import { Pressable, Text, View } from 'react-native';

import MaterialIcon from './MaterialIcon';

/** "Continue learning" card with a dot-path showing lesson sequence progress. */
export default function LearningPathCard({ icon, title, stepLabel, totalSteps, currentStep, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Continue ${title}, ${stepLabel}`}
      className="bg-surface-container-lowest rounded-3xl p-4 shadow-level-2 active:opacity-90"
    >
      <View className="flex-row items-center gap-1 mb-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <React.Fragment key={i}>
            <View
              className={`w-2.5 h-2.5 rounded-full ${i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary' : 'bg-surface-variant'}`}
              style={i === currentStep ? { width: 10, height: 10 } : undefined}
            />
            {i < totalSteps - 1 && (
              <View className={`flex-1 h-[2px] ${i < currentStep ? 'bg-primary' : 'bg-surface-variant'}`} />
            )}
          </React.Fragment>
        ))}
      </View>

      <View className="flex-row items-center gap-4">
        <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center">
          <MaterialIcon name={icon} size={26} color="on-primary" />
        </View>
        <View className="flex-1">
          <Text className="text-[20px] leading-7 font-semibold text-on-surface">{title}</Text>
          <Text className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{stepLabel}</Text>
        </View>
        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
          <MaterialIcon name="arrow_forward" size={20} color="primary" />
        </View>
      </View>
    </Pressable>
  );
}