import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ModeTabs({ value, onChange, options = ['Chat', 'Scan', 'Doc'], className = '' }) {
  return (
    <View className={`flex-row rounded-2xl bg-surface-container p-1 ${className}`} accessibilityLabel="Mode selector">
      {options.map((option) => {
        const isActive = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            // No conditional shadow/opacity className here — shadow moves to a plain style object.
            className={`flex-1 items-center rounded-xl px-3 py-2 ${isActive ? 'bg-surface-container-lowest' : ''}`}
            style={isActive ? styles.activeShadow : undefined}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text className={`font-label-sm ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
});