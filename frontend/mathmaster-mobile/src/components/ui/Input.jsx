import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import MaterialIcon from './MaterialIcon';

/**
 * Material 3 outlined input with icon slots and inline validation.
 */
export default function Input({
  label,
  value,
  onChangeText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  helperText,
  secureTextEntry = false,
  accessibilityLabel,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#ba1a1a' : focused ? '#006591' : '#6e7881';

  return (
    <View className="mb-4">
      <View
        className="flex-row items-center rounded-2xl bg-transparent px-3"
        style={{ borderWidth: focused ? 2 : 1, borderColor, marginVertical: focused ? -1 : 0 }}
      >
        {leftIcon ? (
          <MaterialIcon name={leftIcon} size={22} color={focused ? 'primary' : 'on-surface-variant'} />
        ) : null}
        <TextInput
          className="flex-1 py-3 px-2 font-body-md text-body-md text-on-surface"
          placeholderTextColor="rgba(62, 72, 80, 0.5)"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secureTextEntry}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityRole="none"
          {...rest}
        />
        {rightIcon ? (
          <View accessibilityRole="button" accessibilityLabel={`${label} toggle`}>
            <MaterialIcon name={rightIcon} size={22} color="outline" onPress={onRightIconPress} />
          </View>
        ) : null}
      </View>
      {label && !focused && !value ? null : (
        <Text
          className="absolute font-label-sm text-label-sm bg-background px-1"
          style={{
            top: -8,
            left: 12,
            color: error ? '#ba1a1a' : focused ? '#006591' : '#3e4850',
          }}
        >
          {label}
        </Text>
      )}
      {error ? <Text className="font-body-sm text-body-sm text-error mt-1">{error}</Text> : null}
      {!error && helperText ? (
        <Text className="font-body-sm text-body-sm text-on-surface-variant mt-1">{helperText}</Text>
      ) : null}
    </View>
  );
}
