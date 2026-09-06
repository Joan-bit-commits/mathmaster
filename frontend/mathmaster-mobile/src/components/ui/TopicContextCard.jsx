import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import MaterialIcon from './MaterialIcon';
import UNEBCodeBadge from './UNEBCodeBadge';

export default function TopicContextCard({ topic, code, level, textbook, onPress, className = '' }) {
  const open = () => { Haptics.selectionAsync().catch(() => {}); onPress?.(); };
  return <Pressable onPress={open} className={`rounded-2xl bg-surface-container-lowest p-4 shadow-level-1 ${className}`} accessibilityRole="button" accessibilityLabel={`Topic context ${topic || 'mathematics'}`}>
    <View className="flex-row items-start gap-3"><View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-fixed"><MaterialIcon name="menu_book" size={21} color="primary" /></View><View className="flex-1"><View className="flex-row flex-wrap items-center gap-2"><Text className="font-title-lg text-on-surface">{topic || 'Mathematics'}</Text><UNEBCodeBadge code={code} /></View><Text className="font-body-sm mt-1 text-on-surface-variant">{level || 'Uganda curriculum'}</Text>{textbook && <Text className="font-body-sm mt-2 text-on-surface-variant">{textbook}</Text>}<Text className="font-label-sm mt-3 text-primary">View in syllabus →</Text></View></View>
  </Pressable>;
}