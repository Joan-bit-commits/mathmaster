import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text } from 'react-native';

import { mapIcon } from '../lib/iconMap';

const PALETTE = {
  primary: '#006591',
  'on-primary': '#ffffff',
  'on-surface': '#0b1c30',
  'on-surface-variant': '#3e4850',
  outline: '#6e7881',
  error: '#ba1a1a',
  tertiary: '#855300',
  white: '#ffffff',
};

/**
 * Material icon wrapper resolving Stitch Material Symbols names to
 * MaterialIcons. Falls back to a bracketed Text glyph when unmapped.
 */
export default function MaterialIcon({ name, size = 24, color = 'on-surface-variant', style, ...rest }) {
  const resolved = mapIcon(name);
  const iconColor = PALETTE[color] || color;
  if (!resolved) {
    return (
      <Text style={[{ fontSize: size * 0.6, color: iconColor }, style]} accessibilityLabel={name}>
        [{name}]
      </Text>
    );
  }
  return <MaterialIcons name={resolved} size={size} color={iconColor} style={style} {...rest} />;
}
