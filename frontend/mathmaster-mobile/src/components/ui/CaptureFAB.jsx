import React, { useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import MaterialIcon from "./MaterialIcon";

export default function CaptureFAB({
  onPress,
  visible = true,
  className = "",
  style,
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 250 }),
      withTiming(1, { duration: 250 }),
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[animatedStyle, style]} className={className}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => {},
          );
          onPress?.();
        }}
        className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-level-3"
        accessibilityRole="button"
        accessibilityLabel="Scan a math problem"
      >
        <MaterialIcon name="photo_camera" size={26} color="white" />
      </Pressable>
    </Animated.View>
  );
}