import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// step is normalized server-side (see curriculum/services.py::_normalize_solution_steps),
// but this stays defensive too: rendering a non-primitive value directly as a
// <Text> child crashes React with "Objects are not valid as a React child",
// and that's exactly the failure mode when an AI response doesn't match the
// expected shape (a step arriving as a string, or `text`/`mark` arriving as
// a nested object instead of a string/number).
function toDisplayText(value, fallback = '') {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

export default function SolutionStep({ step, index = 0, onExplain, className = '' }) {
  const safeStep = step && typeof step === 'object' ? step : {};
  const label = typeof safeStep.step === 'string' || typeof safeStep.step === 'number'
    ? safeStep.step
    : index + 1;
  const text = toDisplayText(safeStep.text, typeof step === 'string' ? step : '');
  const mark = typeof safeStep.mark === 'string' || typeof safeStep.mark === 'number' ? safeStep.mark : null;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(250)}
      className={`rounded-2xl bg-surface-container-lowest p-4 shadow-level-1 ${className}`}
    >
      <View className="flex-row gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Text className="font-title-lg text-on-primary">{label}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-body-md text-on-surface">{text}</Text>
          {mark != null && (
            <Text className="mt-2 self-start rounded-full bg-primary-fixed px-2 py-0.5 font-label-sm text-on-primary-fixed">
              {mark}
            </Text>
          )}
          {onExplain && (
            <Pressable
              onPress={onExplain}
              className="mt-3"
              accessibilityRole="button"
              accessibilityLabel="Explain this step differently"
            >
              <Text className="font-label-sm text-primary">Explain differently</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
