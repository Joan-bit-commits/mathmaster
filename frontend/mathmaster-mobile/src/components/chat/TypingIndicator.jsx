import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

function Dot({ delay }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, [delay, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * progress.value,
    transform: [{ translateY: -3 * progress.value }],
  }));
  return <Animated.View style={style} className="h-2 w-2 rounded-full bg-outline" />;
}

/** Three softly bouncing dots shown before the first token of a reply arrives. */
export default function TypingIndicator() {
  return (
    <View
      className="flex-row items-center gap-1.5 py-3"
      accessibilityRole="progressbar"
      accessibilityLabel="The tutor is thinking"
    >
      {[0, 160, 320].map((d) => (
        <Dot key={d} delay={d} />
      ))}
    </View>
  );
}
