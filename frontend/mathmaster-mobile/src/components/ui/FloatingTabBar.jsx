import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import MaterialIcon from "./MaterialIcon";

const COLORS = {
  primary: "#006591",
  onSurfaceVariant: "#3e4850",
  barBg: "#e5eeff",
};

/**
 * FloatingTabBar
 * Props:
 *   tabs: [{ key, label, icon }]  — tab definitions keyed by a route-name match.
 *   state, navigation: from the Tabs navigator's tabBar render prop.
 *
 * All tab buttons are the SAME size — no oversized center button.
 */
export default function FloatingTabBar({ tabs, state, navigation }) {
  const insets = useSafeAreaInsets();

  const focusedRoute = state.routes[state.index];
  const isOnVisibleTab = tabs.some((tab) => matchesKey(focusedRoute.name, tab.key));
  if (!isOnVisibleTab) return null;

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {tabs.map((tab) => {
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

          return (
            <TabItem
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

function matchesKey(routeName, key) {
  return routeName === key || routeName.endsWith("/" + key);
}

function TabItem({ tab, isFocused, onPress }) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.12 : 1, { damping: 12, stiffness: 180 });
    lift.value = withSpring(isFocused ? -3 : 0, { damping: 12, stiffness: 180 });
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
});
