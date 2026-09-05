import { Tabs } from 'expo-router';
import React from 'react';

import TeacherFloatingTabBar from '../../src/components/ui/TeacherFloatingTabBar';

export default function TeacherLayout() {
  return (
    <Tabs tabBar={(props) => <TeacherFloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="curriculum" options={{ title: 'Curriculum' }} />
      <Tabs.Screen name="students" options={{ title: 'Students' }} />
      <Tabs.Screen name="content" options={{ title: 'Content' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

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
