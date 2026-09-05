import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

/** Horizontal scrollable level/category tabs — for browsing, not tagging. */
export default function LevelTabs({ options, value, onChange }) {
  return (
    <ScrollView
      horizontal
      style={{ height: 60 }}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ alignItems: 'center', columnGap: 8, paddingHorizontal: 24 }}
    >
      {options.map((opt) => {
        const isActive = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(opt);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter ${opt}`}
            style={{ height: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}
            className={`rounded-full ${isActive ? 'bg-primary' : 'bg-surface-container-low'}`}
          >
            <Text
              style={{ fontSize: 12, lineHeight: 18, includeFontPadding: false, textAlignVertical: 'center' }}
              className={`font-label-sm text-label-sm ${isActive ? 'text-on-primary font-semibold' : 'text-on-surface-variant'}`}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}