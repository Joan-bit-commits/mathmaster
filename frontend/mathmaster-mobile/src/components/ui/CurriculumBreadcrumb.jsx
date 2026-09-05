import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import MaterialIcon from './MaterialIcon';

export default function CurriculumBreadcrumb({ items = [], onPress = () => {}, className = '' }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} className={className} contentContainerStyle={{ alignItems: 'center' }} accessibilityLabel="Curriculum breadcrumb">
    {items.map((item, index) => <View key={`${item.label}-${index}`} className="flex-row items-center">
      {index > 0 && <MaterialIcon name="chevron_right" size={16} color="outline" />}
      <Pressable onPress={() => onPress(item, index)} accessibilityRole="button" accessibilityLabel={`Open ${item.label}`}><Text className={`font-label-sm px-1 ${index === items.length - 1 ? 'text-primary' : 'text-on-surface-variant'}`}>{item.label}</Text></Pressable>
    </View>)}
  </ScrollView>;
}