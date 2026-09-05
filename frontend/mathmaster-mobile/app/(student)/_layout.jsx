import { Tabs } from 'expo-router';
import React from 'react';

import FloatingTabBar from '../../src/components/ui/FloatingTabBar';

const TABS = [
  { key: 'index', name: '(tabs)/index', label: 'Home', icon: 'home' },
  { key: 'topics', name: '(tabs)/topics', label: 'Topics', icon: 'book' },
  { key: 'ai-tutor', name: '(tabs)/ai-tutor', label: 'AI Tutor', icon: 'smart_toy' },
  { key: 'performance', name: '(tabs)/performance', label: 'Performance', icon: 'leaderboard' },
  { key: 'profile', name: '(tabs)/profile', label: 'Profile', icon: 'person' },
];

export default function StudentLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar tabs={TABS} {...props} />} screenOptions={{ headerShown: false }}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}

      {/* Non-tab screens live in this navigator but have no tab button. */}
      <Tabs.Screen name="ai-tutor/history" options={{ href: null }} />
      <Tabs.Screen name="ai-tutor/chat/[sessionId]" options={{ href: null }} />
      <Tabs.Screen name="topic/[id]" options={{ href: null }} />
      <Tabs.Screen name="lesson/[id]" options={{ href: null }} />
      <Tabs.Screen name="lesson/[id]/quizzes" options={{ href: null }} />
      <Tabs.Screen name="quiz/[id]" options={{ href: null }} />
      <Tabs.Screen name="performance/[period]" options={{ href: null }} />
    </Tabs>
  );
}
