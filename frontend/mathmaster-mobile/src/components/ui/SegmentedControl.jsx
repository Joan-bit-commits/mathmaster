import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export default function SegmentedControl({ options, value, onChange, className = '' }) {
  const [segmentWidth, setSegmentWidth] = useState(0);
  const translateX = useSharedValue(0);
  const activeIndex = Math.max(0, options.findIndex((o) => o.key === value));

  useEffect(() => {
    if (segmentWidth) {
      translateX.value = withSpring(activeIndex * segmentWidth, {
        damping: 30,
        stiffness: 220,
        mass: 0.9,
      });
    }
  }, [activeIndex, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const onLayout = (e) => setSegmentWidth(e.nativeEvent.layout.width / options.length);

  return (
    <View onLayout={onLayout} className={`flex-row bg-surface-container-low rounded-full p-1 relative ${className}`} accessibilityRole="tablist">
      {segmentWidth > 0 && (
        <Animated.View
          style={[indicatorStyle, { position: 'absolute', top: 4, bottom: 4, left: 4, width: segmentWidth - 8 }]}
          className="bg-primary rounded-full"
        />
      )}
      {options.map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => { Haptics.selectionAsync().catch(() => {}); onChange(opt.key); }}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === opt.key }}
          accessibilityLabel={opt.label}
          className="flex-1 items-center justify-center py-2.5 z-10"
        >
          <Text className={`font-label-sm text-label-sm ${value === opt.key ? 'text-on-primary' : 'text-on-surface-variant'}`}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}