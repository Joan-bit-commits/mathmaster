import React from 'react';
import { Pressable, Text, View } from 'react-native';

import MaterialIcon from './MaterialIcon';

/** Top app bar: back/menu button, centered or left title, right action slot. */
export default function AppBar({ title, subtitle, onBack, rightIcon, onRightIconPress, transparent = false }) {
  return (
    <View
      className={`h-16 px-6 flex-row items-center justify-between ${transparent ? '' : 'bg-background/95 border-b border-[#e5eeff]/50'}`}
      accessibilityRole="header"
    >
      <View className="w-10">
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="w-10 h-10 rounded-full bg-surface-container-low items-center justify-center"
          >
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Pressable>
        ) : null}
      </View>
      <View className="flex-1 items-center">
        <Text className="text-[24px] leading-8 font-semibold text-primary" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-label-sm text-label-sm text-on-surface-variant" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="w-10 items-end">
        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel={rightIcon}
            className="w-10 h-10 items-center justify-center"
          >
            <MaterialIcon name={rightIcon} size={22} color="on-surface-variant" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
