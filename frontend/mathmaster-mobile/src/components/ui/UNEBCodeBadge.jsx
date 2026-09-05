import React from 'react';
import { Pressable, Text } from 'react-native';

export default function UNEBCodeBadge({ code, onPress, size = 'sm', className = '', accessibilityLabel }) {
  if (!code) return null;
  const content = <Text className={`font-mono text-on-primary-fixed ${size === 'md' ? 'text-[14px]' : 'text-[11px]'}`}>{code}</Text>;
  const classes = `bg-primary-fixed rounded-full px-2 ${size === 'md' ? 'py-1' : 'py-0.5'} ${className}`;
  if (!onPress) return <Text className={classes} accessibilityLabel={accessibilityLabel || `UNEB code ${code}`}>{content}</Text>;
  return <Pressable className={classes} onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel || `View syllabus for ${code}`}>{content}</Pressable>;
}