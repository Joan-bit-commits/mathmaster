import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function AnimatedBackground({ colors = ['#006591', '#4648d4'], style }) {
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);

  useEffect(() => {
  drift1.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }), -1, true);
  drift2.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) }), -1, true);
}, [drift1, drift2]);

  const blob1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift1.value * 30 - 15 }, { translateY: drift1.value * -20 + 10 }],
  }));
  const blob2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift2.value * -25 + 10 }, { translateY: drift2.value * 25 - 10 }],
  }));

  return (
    <View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }, style]}>
      <Animated.View
        style={[blob1Style, { position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: colors[0], opacity: 0.16 }]}
      />
      <Animated.View
        style={[blob2Style, { position: 'absolute', bottom: -100, left: -70, width: 300, height: 300, borderRadius: 150, backgroundColor: colors[1], opacity: 0.12 }]}
      />
    </View>
  );
}