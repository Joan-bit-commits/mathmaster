import { Tabs } from 'expo-router';
import React from 'react';

import FloatingTabBar from '../../../src/components/ui/FloatingTabBar';

export default function StudentTabsLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="topics" options={{ title: 'Topics' }} />
      <Tabs.Screen name="ai-tutor" options={{ title: 'AI Tutor' }} />
      <Tabs.Screen name="performance" options={{ title: 'Performance' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}