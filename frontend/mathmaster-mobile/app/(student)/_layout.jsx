import { Tabs } from 'expo-router';
import React from 'react';

import FloatingTabBar from '../../src/components/ui/FloatingTabBar';

export default function StudentLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="topics" options={{ title: 'Topics' }} />
      <Tabs.Screen name="ai-tutor" options={{ title: 'AI Tutor' }} />
      <Tabs.Screen name="performance" options={{ title: 'Performance' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

      {/* Non-tab screens live in this navigator but have no tab button. */}
      <Tabs.Screen name="ai-tutor/history" options={{ href: null }} />
      <Tabs.Screen name="ai-tutor/chat/[sessionId]" options={{ href: null }} />
      <Tabs.Screen name="topic/[id]" options={{ href: null }} />
      <Tabs.Screen name="lesson/[id]" options={{ href: null }} />
      <Tabs.Screen name="lesson/[id]/quizzes" options={{ href: null }} />
      <Tabs.Screen name="quiz/[id]" options={{ href: null }} />
      <Tabs.Screen name="performance/[period]" options={{ href: null }} />
      <Tabs.Screen name="scan/index" options={{ href: null }} />
      <Tabs.Screen name="scan/camera" options={{ href: null }} />
      <Tabs.Screen name="scan/review" options={{ href: null }} />
      <Tabs.Screen name="scan/result" options={{ href: null }} />
      <Tabs.Screen name="documents/index" options={{ href: null }} />
      <Tabs.Screen name="documents/upload" options={{ href: null }} />
      <Tabs.Screen name="documents/[id]" options={{ href: null }} />
      <Tabs.Screen name="curriculum/index" options={{ href: null }} />
      <Tabs.Screen name="curriculum/topic" options={{ href: null }} />
    </Tabs>
  );
}
