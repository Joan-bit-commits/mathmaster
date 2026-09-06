import React, { useCallback, useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import MaterialIcon from './MaterialIcon';

const PRIMARY = '#006591';
const ON_SURFACE_VARIANT = '#3e4850';
const SURFACE = '#e5eeff';

// This array is now the ONLY source of truth for display order — state.routes
// order is not reliable for this as of SDK 56's new Tabs implementation.
const TABS = [
  { name: 'index', label: 'Home', icon: 'dashboard' },
  { name: 'content', label: 'Content', icon: 'add-box' },
  { name: 'curriculum', label: 'Curriculum', icon: 'menu-book' },
  { name: 'students', label: 'Students', icon: 'groups' },
  { name: 'profile', label: 'Profile', icon: 'person' },
];

const bare = (name) => name.replace(/^\(tabs\)\//, '');

function TabSlot({ meta, isFocused, onPress }) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, { damping: 14, stiffness: 200 });
    lift.value = withSpring(isFocused ? -2 : 0, { damping: 14, stiffness: 200 });
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 12, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(isFocused ? 1.1 : 1, { damping: 12, stiffness: 300 });
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={`${meta.label} tab`}
      style={styles.slot}
    >
      <Animated.View style={iconStyle}>
        <MaterialIcon name={meta.icon} size={24} color={isFocused ? 'primary' : 'on-surface-variant'} />
      </Animated.View>
      <Text numberOfLines={1} style={[styles.label, { color: isFocused ? PRIMARY : ON_SURFACE_VARIANT }]}>
        {meta.label}
      </Text>
    </Pressable>
  );
}

export default function TeacherFloatingTabBar({ state, navigation, insets: insetsProp }) {
  let insets = { top: 0, bottom: 0, left: 0, right: 0 };
  try {
    const safe = useSafeAreaInsets();
    if (safe && typeof safe.bottom === 'number') insets = safe;
  } catch (_) {
    // provider not mounted — keep defaults
  }
  if (insetsProp && typeof insetsProp.bottom === 'number') insets = insetsProp;

  const bottomPad = Math.max(insets.bottom, 12) + 10;

  const currentName = bare(state.routes[state.index]?.name || '');

  // Hide entirely on non-tab pages (student detail, authoring forms, …).
  if (currentName && !TABS.some((t) => t.name === currentName)) {
    return null;
  }

  const handlePress = useCallback(
    (route, isFocused) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      Haptics.selectionAsync().catch(() => {});
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation],
  );

  // Build the slot list by walking OUR order (TABS), looking up each
  // matching route in state.routes — not the other way around.
  const orderedSlots = TABS
    .map((meta) => {
      const route = state.routes.find((r) => bare(r.name) === meta.name);
      return route ? { meta, route } : null;
    })
    .filter(Boolean);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomPad }]}>
      <View style={styles.bar}>
        {orderedSlots.map(({ meta, route }) => {
          const isFocused = state.routes[state.index]?.key === route.key;
          return (
            <TabSlot
              key={route.key}
              meta={meta}
              isFocused={isFocused}
              onPress={() => handlePress(route, isFocused)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
    overflow: 'visible',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 32,
    paddingHorizontal: 8,
    height: 64,
    width: '100%',
    maxWidth: 480,
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#0b1c30',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 18,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
});