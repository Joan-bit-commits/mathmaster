import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import MaterialIcon from './MaterialIcon';

const SIZES = { sm: 'h-9', md: 'h-12', lg: 'h-14' };

const VARIANTS = {
  primary: 'bg-primary shadow-level-1',
  secondary: 'border-[1.5px] border-primary bg-transparent',
  tertiary: 'bg-transparent',
  destructive: 'bg-error',
  gradient: 'bg-primary-container shadow-level-1',
  icon: 'w-10 h-10 rounded-full bg-surface-container-low items-center justify-center',
};

const TEXT_COLORS = {
  primary: 'text-on-primary',
  secondary: 'text-primary',
  tertiary: 'text-primary',
  destructive: 'text-on-error',
  gradient: 'text-on-primary-container',
  icon: 'text-on-surface-variant',
};

/**
 * Material 3 button with haptics + press scale animation.
 * Variants: primary | secondary | tertiary | destructive | gradient | icon
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  label,
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  accessibilityLabel,
  className = '',
  children,
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
    Haptics.impactAsync(
      variant === 'primary' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});
  };
  const handlePressOut = () => scale.value = withTiming(1, { duration: 120 });

  const sizeClass = variant === 'icon' ? '' : SIZES[size];
  const widthClass = fullWidth || variant !== 'icon' ? 'w-full' : '';

  return (
    <Animated.View style={[animatedStyle, variant === 'icon' ? null : { width: fullWidth ? '100%' : undefined }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        className={`items-center justify-center flex-row rounded-2xl px-6 active:opacity-80 ${sizeClass} ${VARIANTS[variant]} ${widthClass} ${disabled ? 'opacity-50' : ''} ${className}`}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' || variant === 'destructive' ? '#ffffff' : '#006591'} />
        ) : (
          <View className="flex-row items-center justify-center gap-2">
            {icon ? <MaterialIcon name={icon} size={size === 'sm' ? 18 : 20} color={TEXT_COLORS[variant]} /> : null}
            {label ? (
              <Text className={`font-label-sm text-label-sm ${TEXT_COLORS[variant]}`}>{label}</Text>
            ) : (
              children
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
