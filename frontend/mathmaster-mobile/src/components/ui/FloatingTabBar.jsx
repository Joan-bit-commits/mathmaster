import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import MaterialIcon from "./MaterialIcon";

const COLORS = {
  primary: "#006591",
  onSurfaceVariant: "#3e4850",
  barBg: "#e5eeff",
};

const VISIBLE_TABS = [
  { key: "index", label: "Home", icon: "home" },
  { key: "topics", label: "Topics", icon: "book" },
  { key: "ai-tutor", label: "AI Tutor", icon: "smart_toy", isAI: true },
  { key: "performance", label: "Performance", icon: "leaderboard" },
  { key: "profile", label: "Profile", icon: "person" },
];

function matchesKey(routeName, key) {
  return routeName === key || routeName.endsWith("/" + key);
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function RegularTab({ tab, isFocused, onPress }) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.12 : 1, {
      damping: 12,
      stiffness: 180,
    });
    lift.value = withSpring(isFocused ? -3 : 0, {
      damping: 12,
      stiffness: 180,
    });
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={tab.label}
    >
      <Animated.View style={iconStyle}>
        <MaterialIcon
          name={tab.icon}
          size={23}
          color={isFocused ? "primary" : "on-surface-variant"}
        />
      </Animated.View>
      <Text
        style={[
          styles.label,
          { color: isFocused ? COLORS.primary : COLORS.onSurfaceVariant },
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

function AiTabButton({ tab, isFocused, onPress }) {
  const pressScale = useSharedValue(1);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // gentle attention pulse while not focused; stops when active
    if (!isFocused) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.06, {
            duration: 900,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value * pulse.value }],
  }));

  return (
    <View style={styles.aiSlot}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          pressScale.value = withSpring(0.9, { damping: 10, stiffness: 300 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, { damping: 10, stiffness: 300 });
        }}
        style={[styles.aiButton, animatedStyle]}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={tab.label}
      >
        <MaterialIcon name={tab.icon} size={26} color="on-primary" />
      </AnimatedPressable>
      <Text
        style={[
          styles.aiLabel,
          isFocused && { color: COLORS.primary, fontWeight: "700" },
        ]}
      >
        {tab.label}
      </Text>
    </View>
  );
}

export default function FloatingTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  const focusedRoute = state.routes[state.index];
  const isOnVisibleTab = VISIBLE_TABS.some((tab) =>
    matchesKey(focusedRoute.name, tab.key),
  );
  if (!isOnVisibleTab) return null;

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {VISIBLE_TABS.map((tab) => {
          const route = state.routes.find((r) => matchesKey(r.name, tab.key));
          if (!route) return null;

          const routeIndex = state.routes.indexOf(route);
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            import("expo-haptics")
              .then((H) => H.selectionAsync())
              .catch(() => {});
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          if (tab.isAI) {
            return (
              <AiTabButton
                key={route.key}
                tab={tab}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          }

          return (
            <RegularTab
              key={route.key}
              tab={tab}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.barBg,
    borderRadius: 28,
    height: 64,
    width: "92%",
    paddingHorizontal: 6,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  label: { fontSize: 11, fontWeight: "600" },
  aiSlot: { flex: 1, alignItems: "center", justifyContent: "flex-start" },
  aiButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -26,
    borderWidth: 4,
    borderColor: COLORS.barBg,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
});
