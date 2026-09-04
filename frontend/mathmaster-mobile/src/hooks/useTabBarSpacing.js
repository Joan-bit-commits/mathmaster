// src/hooks/useTabBarSpacing.js
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AI_BUTTON_OVERHANG = 0;

export function useTabBarSpacing() {
  const tabBarHeight = useBottomTabBarHeight();
  return tabBarHeight > 0 ? tabBarHeight + AI_BUTTON_OVERHANG : 0;
}