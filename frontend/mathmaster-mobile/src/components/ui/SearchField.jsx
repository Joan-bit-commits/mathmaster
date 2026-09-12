import React from 'react';
import { TextInput, View } from 'react-native';

import MaterialIcon from './MaterialIcon';

/** Borderless search field — shadow instead of outline, matches the app's card language. */
export default function SearchField({ value, onChangeText, placeholder = 'Search…', accessibilityLabel }) {
  return (
    <View className="flex-row items-center gap-2 bg-surface-container-lowest rounded-2xl px-3 py-2.5 shadow-level-1">
      <MaterialIcon name="search" size={20} color="outline" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8b96a3"
        className="flex-1 text-[15px] leading-5 text-on-surface"
        accessibilityLabel={accessibilityLabel || placeholder}
        returnKeyType="search"
      />
      {value?.length > 0 && (
        <MaterialIcon
          name="close"
          size={18}
          color="outline"
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        />
      )}
    </View>
  );
}