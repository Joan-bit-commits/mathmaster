import { Tabs } from 'expo-router';
import React from 'react';

import MaterialIcon from '../../src/components/ui/MaterialIcon';

const TABS = [
  { name: '(tabs)/index', label: 'Home', icon: 'home' },
  { name: '(tabs)/topics', label: 'Topics', icon: 'book' },
  { name: '(tabs)/ai-tutor', label: 'AI Tutor', icon: 'smart_toy' },
  { name: '(tabs)/performance', label: 'Performance', icon: 'leaderboard' },
  { name: '(tabs)/profile', label: 'Profile', icon: 'person' },
];

export default function StudentLayout() {
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
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color }) => (
              <MaterialIcon name={tab.icon} size={24} color={color === '#006591' ? 'primary' : 'on-surface-variant'} />
            ),
          }}
        />
      ))}
      {/* Non-tab screens live in this navigator but have no tab button. */}
      <Tabs.Screen name="ai-tutor/history" options={{ href: null }} />
      <Tabs.Screen name="ai-tutor/chat/[sessionId]" options={{ href: null }} />
      <Tabs.Screen name="topic/[id]" options={{ href: null }} />
      <Tabs.Screen name="lesson/[id]" options={{ href: null }} />
      <Tabs.Screen name="lesson/[id]/quizzes" options={{ href: null }} />
      <Tabs.Screen name="quiz/[id]" options={{ href: null }} />
      <Tabs.Screen name="quiz/[id]/results" options={{ href: null }} />
      <Tabs.Screen name="performance/[period]" options={{ href: null }} />
    </Tabs>
  );
}
