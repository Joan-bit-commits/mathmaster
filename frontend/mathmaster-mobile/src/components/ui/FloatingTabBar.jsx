import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import MaterialIcon from './MaterialIcon';

// Luminous Mathematics palette
const PRIMARY = '#006591';
const PRIMARY_DARK = '#004c6e'; // on-primary-fixed-variant — visibly darker than PRIMARY
const ON_PRIMARY = '#ffffff';
const SURFACE = '#e5eeff';
const ON_SURFACE_VARIANT = '#3e4850';

/**
 * Route names are BARE ('index', 'topics', …) because this bar is rendered by
 * the Tabs navigator inside app/(student)/(tabs)/_layout.jsx — the '(tabs)'
 * group segment is not part of the route name at this level.
 */
const TABS = [
  { name: 'index', label: 'Home', icon: 'home' },
  { name: 'topics', label: 'Topics', icon: 'menu-book' },
  { name: 'ai-tutor', label: 'AI Tutor', icon: 'smart_toy' },
  { name: 'performance', label: 'Performance', icon: 'leaderboard' },
  { name: 'profile', label: 'Profile', icon: 'person' },
];
const CENTER_INDEX = 2;
const TAB_NAMES = new Set(TABS.map((t) => t.name));

export default function FloatingTabBar({ state, descriptors, navigation, insets: insetsProp }) {
  let insets = { top: 0, bottom: 0, left: 0, right: 0 };
  try {
    const safe = useSafeAreaInsets();
    if (safe && typeof safe.bottom === 'number') insets = safe;
  } catch (_) {
    // provider not mounted — keep defaults
  }
  if (insetsProp && typeof insetsProp.bottom === 'number') insets = insetsProp;

  const bottomPad = Math.max(insets.bottom, 12) + 10;

  const currentName = state.routes[state.index]?.name;

  // Hide entirely on any non-tab page (history, chat, quiz, etc.)
  if (currentName && !TAB_NAMES.has(currentName)) {
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

  const hasFiveRoutes = state.routes.length >= 5;
  const centerRoute = hasFiveRoutes ? state.routes[CENTER_INDEX] : null;
  const isCenterFocused = hasFiveRoutes && state.index === CENTER_INDEX;

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomPad }]}>
      {/* Floating pill: 4 normal tabs + 1 empty slot for the center button */}
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          if (index === CENTER_INDEX) {
            return <View key={route.key} style={styles.slot} />;
          }
          const isFocused = state.index === index;
          const meta = TABS.find((t) => t.name === route.name) || { label: route.name, icon: 'circle' };
          return (
            <Pressable
              key={route.key}
              onPress={() => handlePress(route, isFocused)}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={`${meta.label} tab`}
              style={({ pressed }) => [styles.slot, pressed && styles.tabPressed]}
            >
              <MaterialIcon
                name={meta.icon}
                size={24}
                color={isFocused ? 'primary' : 'on-surface-variant'}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: isFocused ? PRIMARY : ON_SURFACE_VARIANT },
                ]}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Center AI button — absolutely positioned above the bar */}
      {centerRoute && (
        <View style={styles.centerOverlay} pointerEvents="box-none">
          <Pressable
            onPress={() => handlePress(centerRoute, isCenterFocused)}
            accessibilityRole="button"
            accessibilityState={{ selected: isCenterFocused }}
            accessibilityLabel="AI Tutor tab"
            hitSlop={8}
            style={({ pressed }) => [
              styles.centerButton,
              pressed && styles.centerButtonPressed,
              isCenterFocused && styles.centerButtonFocused,
            ]}
          >
            <MaterialIcon name="smart_toy" size={28} color="on-primary" />
          </Pressable>
        </View>
      )}
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
  tabPressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  centerOverlay: {
    position: 'absolute',
    top: -32,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
    zIndex: 10,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: SURFACE,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  centerButtonPressed: {
    transform: [{ scale: 0.94 }],
  },
  centerButtonFocused: {
    backgroundColor: PRIMARY_DARK,
  },
});
