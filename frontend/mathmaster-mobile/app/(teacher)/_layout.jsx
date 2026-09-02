import { Tabs } from 'expo-router';
import React from 'react';

import MaterialIcon from '../../src/components/ui/MaterialIcon';

const TABS = [
  { name: '(tabs)/index', label: 'Dashboard', icon: 'dashboard' },
  { name: '(tabs)/curriculum', label: 'Curriculum', icon: 'menu-book' },
  { name: '(tabs)/students', label: 'Students', icon: 'groups' },
  { name: '(tabs)/content', label: 'Content', icon: 'add-box' },
  { name: '(tabs)/profile', label: 'Profile', icon: 'person' },
];

export default function TeacherLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#006591',
        tabBarInactiveTintColor: '#3e4850',
        tabBarStyle: { backgroundColor: '#e5eeff', borderTopWidth: 0, height: 64, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
      screenListeners={{ tabPress: () => import('expo-haptics').then((H) => H.selectionAsync()).catch(() => {}) }}
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
      <Tabs.Screen name="topic/[id]" options={{ href: null }} />
      <Tabs.Screen name="student/[id]" options={{ href: null }} />
      <Tabs.Screen name="content/topic/new" options={{ href: null }} />
      <Tabs.Screen name="content/lesson/new" options={{ href: null }} />
      <Tabs.Screen name="content/quiz/new" options={{ href: null }} />
      <Tabs.Screen name="content/question/new" options={{ href: null }} />
    </Tabs>
  );
}
