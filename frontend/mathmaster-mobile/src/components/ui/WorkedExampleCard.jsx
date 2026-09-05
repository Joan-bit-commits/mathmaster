import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import MaterialIcon from './MaterialIcon';

const MARK = { M: 'bg-primary-fixed text-on-primary-fixed', A: 'bg-[#d5f5d5] text-[#1d5c22]', B: 'bg-secondary-fixed text-on-secondary-fixed', cao: 'bg-tertiary-fixed text-on-tertiary-fixed' };
export default function WorkedExampleCard({ example, className = '' }) {
  const [expanded, setExpanded] = useState(false);
  return <View className={`rounded-2xl bg-surface-container-lowest p-4 shadow-level-1 ${className}`}><Text className="font-body-md text-on-surface">{example.problem}</Text><Pressable onPress={() => setExpanded(!expanded)} className="mt-3 flex-row items-center gap-1" accessibilityRole="button" accessibilityLabel={expanded ? 'Hide solution' : 'Show solution'}><Text className="font-label-sm text-primary">{expanded ? 'Hide solution' : 'Show solution'}</Text><MaterialIcon name={expanded ? 'expand_less' : 'expand_more'} size={18} color="primary" /></Pressable>{expanded && <View className="mt-3 gap-2">{(example.solution_steps || []).map((step) => <View key={step.step} className="flex-row gap-2"><Text className="font-label-sm text-primary">{step.step}.</Text><Text className="flex-1 font-body-sm text-on-surface">{step.text}</Text><Text className={`rounded-full px-2 py-0.5 font-label-sm ${MARK[(step.mark || '').split(/[0-9 ]/)[0]] || MARK.cao}`}>{step.mark}</Text></View>)}</View>}</View>;
}