// app/student/(tabs)/_layout.jsx — inner Tabs, only real tabs
import { Tabs } from 'expo-router';
import FloatingTabBar from '../../../src/components/ui/FloatingTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="topics" />
      <Tabs.Screen name="ai-tutor" />
      <Tabs.Screen name="performance" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}