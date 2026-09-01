import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import MaterialIcon from '../../src/components/ui/MaterialIcon';
import { useAuthStore } from '../../src/stores/authStore';

const ICONS = {
  index: 'home',
  topics: 'menu-book',
  'ai-tutor': 'smart_toy',
  performance: 'leaderboard',
  profile: 'person',
};
const LABELS = {
  index: 'Home',
  topics: 'Topics',
  'ai-tutor': 'AI Tutor',
  performance: 'Performance',
  profile: 'Profile',
};

export default function StudentTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#006591',
        tabBarInactiveTintColor: '#3e4850',
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: '#e5eeff',
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIconStyle: { marginTop: 2 },
      }}
      screenListeners={{
        tabPress: () => {
          import('expo-haptics').then((H) => H.selectionAsync()).catch(() => {});
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: LABELS.index,
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcon name={ICONS.index} size={24} color={color === '#006591' ? 'primary' : 'on-surface-variant'} />
          ),
        }}
      />
      <Tabs.Screen name="topics" options={{ title: LABELS.topics, tabBarIcon: ({ color }) => <MaterialIcon name={ICONS.topics} size={24} color={color === '#006591' ? 'primary' : 'on-surface-variant'} /> }} />
      <Tabs.Screen
        name="ai-tutor"
        options={{
          title: LABELS['ai-tutor'],
          tabBarIcon: ({ color }) => (
            <View>
              <MaterialIcon name={ICONS['ai-tutor']} size={24} color={color === '#006591' ? 'primary' : 'on-surface-variant'} />
              {/* notification dot */}
              <View className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error" />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="performance" options={{ title: LABELS.performance, tabBarIcon: ({ color }) => <MaterialIcon name={ICONS.performance} size={24} color={color === '#006591' ? 'primary' : 'on-surface-variant'} /> }} />
      <Tabs.Screen name="profile" options={{ title: LABELS.profile, tabBarIcon: ({ color }) => <MaterialIcon name={ICONS.profile} size={24} color={color === '#006591' ? 'primary' : 'on-surface-variant'} /> }} />
    </Tabs>
  );
}
