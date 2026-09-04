import React from 'react';
import { Text, View } from 'react-native';

const SIZES = { sm: 32, md: 40, lg: 64, xl: 96 };
const FONT_SIZES = { sm: 14, md: 18, lg: 26, xl: 36 };

/** Circular avatar with initial-letter fallback. Sizes: sm | md | lg | xl
 *  No border by default — pass a border/ring via className where one is wanted. */
export default function Avatar({ name = '?', uri, size = 'md', className = '' }) {
  const px = SIZES[size] || SIZES.md;
  return (
    <View
      className={`rounded-full overflow-hidden items-center justify-center bg-primary ${className}`}
      style={{ width: px, height: px }}
      accessibilityLabel={`${name} avatar`}
    >
      {uri ? (
        <ExpoImage uri={uri} px={px} />
      ) : (
        <Text
          className="text-on-primary"
          style={{ fontSize: FONT_SIZES[size] || FONT_SIZES.md, fontWeight: '700' }}
        >
          {(name || '?').charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

function ExpoImage({ uri, px }) {
  const { Image } = require('react-native');
  return <Image source={{ uri }} style={{ width: px, height: px }} resizeMode="cover" />;
}