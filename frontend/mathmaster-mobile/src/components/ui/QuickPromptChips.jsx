import React from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, Text } from 'react-native';

export default function QuickPromptChips({ prompts = [], onSelect, className = '' }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} className={className} contentContainerStyle={{ gap: 8 }}>{prompts.map((prompt) => <Pressable key={prompt} onPress={() => { Haptics.selectionAsync().catch(() => {}); onSelect?.(prompt); }} className="rounded-full bg-primary-fixed px-3 py-2" accessibilityRole="button" accessibilityLabel={prompt}><Text className="font-label-sm text-on-primary-fixed">{prompt}</Text></Pressable>)}</ScrollView>;
}