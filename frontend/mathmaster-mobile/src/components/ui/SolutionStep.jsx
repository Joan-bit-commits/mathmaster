import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SolutionStep({ step, index = 0, onExplain, className = '' }) {
  return <Animated.View entering={FadeInDown.delay(index * 50).duration(250)} className={`rounded-2xl bg-surface-container-lowest p-4 shadow-level-1 ${className}`}><View className="flex-row gap-3"><View className="h-8 w-8 items-center justify-center rounded-full bg-primary"><Text className="font-title-lg text-on-primary">{step.step || index + 1}</Text></View><View className="flex-1"><Text className="font-body-md text-on-surface">{step.text}</Text>{step.mark && <Text className="mt-2 self-start rounded-full bg-primary-fixed px-2 py-0.5 font-label-sm text-on-primary-fixed">{step.mark}</Text>}{onExplain && <Pressable onPress={onExplain} className="mt-3" accessibilityRole="button" accessibilityLabel="Explain this step differently"><Text className="font-label-sm text-primary">Explain differently</Text></Pressable>}</View></View></Animated.View>;
}