import { Tabs } from 'expo-router';
import React from 'react';

import FloatingTabBar from '../../src/components/ui/FloatingTabBar';

const TABS = [
  { key: 'index', name: '(tabs)/index', label: 'Dashboard', icon: 'dashboard' },
  { key: 'curriculum', name: '(tabs)/curriculum', label: 'Curriculum', icon: 'menu-book' },
  { key: 'students', name: '(tabs)/students', label: 'Students', icon: 'groups' },
  { key: 'content', name: '(tabs)/content', label: 'Content', icon: 'add-box' },
  { key: 'profile', name: '(tabs)/profile', label: 'Profile', icon: 'person' },
];

export default function TeacherLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar tabs={TABS} {...props} />} screenOptions={{ headerShown: false }}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}

      {/* Non-tab screens live in this navigator but have no tab button. */}
      <Tabs.Screen name="topic/[id]" options={{ href: null }} />
      <Tabs.Screen name="student/[id]" options={{ href: null }} />
      <Tabs.Screen name="content/topic/new" options={{ href: null }} />
      <Tabs.Screen name="content/lesson/new" options={{ href: null }} />
      <Tabs.Screen name="content/quiz/new" options={{ href: null }} />
      <Tabs.Screen name="content/question/new" options={{ href: null }} />
    </Tabs>
  );
}
