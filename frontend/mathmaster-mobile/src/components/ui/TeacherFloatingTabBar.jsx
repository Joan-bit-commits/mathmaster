import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import MaterialIcon from './MaterialIcon';

// Luminous Mathematics palette — matches FloatingTabBar (student).
const PRIMARY = '#006591';
const ON_SURFACE_VARIANT = '#3e4850';
const SURFACE = '#e5eeff';

/**
 * TeacherFloatingTabBar
 *
 * Same floating bar as the student version (FloatingTabBar.jsx) but with ALL
 * five icon buttons identical — no oversized raised center button.
 *
 * Route names may arrive group-prefixed ('(tabs)/curriculum'); matching strips
 * the prefix so screens can live in a (tabs)/ folder.
 */
const TABS = [
  { name: 'index', label: 'Home', icon: 'dashboard' },
  { name: 'curriculum', label: 'Curriculum', icon: 'menu-book' },
  { name: 'students', label: 'Students', icon: 'groups' },
  { name: 'content', label: 'Content', icon: 'add-box' },
  { name: 'profile', label: 'Profile', icon: 'person' },
];

const bare = (name) => name.replace(/^\(tabs\)\//, '');
const tabFor = (routeName) => TABS.find((t) => t.name === bare(routeName));

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

  const tabRoutes = state.routes.filter((r) => tabFor(r.name));

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomPad }]}>
      <View style={styles.bar}>
        {tabRoutes.map((route) => {
          const isFocused = state.routes[state.index]?.key === route.key;
          const meta = tabFor(route.name) || { label: route.name, icon: 'circle' };
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
});
