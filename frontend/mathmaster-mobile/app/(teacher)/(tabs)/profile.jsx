import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Avatar from '../../../src/components/ui/Avatar';
import Button from '../../../src/components/ui/Button';
import Screen from '../../../src/components/ui/Screen';
import SettingsRow from '../../../src/components/ui/SettingsRow';
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';
import { useAuthStore } from '../../../src/stores/authStore';

const SECTIONS = [
  {
    title: 'Teaching',
    dot: '#006591',
    items: [
      { icon: 'menu_book', label: 'Curriculum', tint: '#c9e6ff', iconColor: '#003751', route: '/(teacher)/(tabs)/curriculum' },
      { icon: 'groups', label: 'Students', tint: '#c9e6ff', iconColor: '#003751', route: '/(teacher)/(tabs)/students' },
      { icon: 'add_box', label: 'Authoring hub', tint: '#c9e6ff', iconColor: '#003751', route: '/(teacher)/(tabs)/content' },
    ],
  },
  {
    title: 'Account',
    dot: '#4648d4',
    items: [
      { icon: 'person', label: 'Edit profile', tint: '#e1e0ff', iconColor: '#07006c', route: '/(shared)/edit-profile' },
      { icon: 'lock', label: 'Change password', tint: '#e1e0ff', iconColor: '#07006c', route: '/(shared)/change-password' },
    ],
  },
  {
    title: 'App',
    dot: '#855300',
    items: [
      { icon: 'settings', label: 'Settings', tint: '#ffddb8', iconColor: '#4a2c00', route: '/(shared)/settings' },
      { icon: 'notifications', label: 'Notifications', tint: '#ffddb8', iconColor: '#4a2c00', route: '/(shared)/notifications' },
    ],
  },
];

export default function TeacherProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const tabBarSpacing = useTabBarSpacing();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Teacher profile">
      <Screen>
        <ScrollView
          contentContainerStyle={{ paddingBottom: tabBarSpacing + 24 }}
          contentContainerClassName="px-[24px]"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center py-6">
            <View>
              <Avatar name={user?.first_name || user?.username || 'T'} size="xl" />
              <View className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface-container-lowest items-center justify-center shadow-level-1">
                <Text className="text-[14px]">📐</Text>
              </View>
            </View>
            <Text accessibilityRole="header" className="text-[22px] leading-8 font-semibold text-on-surface mt-3">
              {user?.first_name || user?.username || 'Teacher'}
            </Text>
            <View className="bg-[#c9e6ff] rounded-full px-3 py-1 mt-2">
              <Text className="font-label-sm text-label-sm text-[#003751]">Mathematics · S1–S6</Text>
            </View>
          </View>

          {SECTIONS.map((section) => (
            <View key={section.title} className="mb-6">
              <View className="flex-row items-center gap-2 mb-2 px-1">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: section.dot }} />
                <Text className="text-[15px] leading-5 font-semibold text-on-surface">{section.title}</Text>
              </View>
              <View className="bg-surface-container-lowest rounded-2xl shadow-level-1 overflow-hidden">
                {section.items.map((item, i) => (
                  <View key={item.label}>
                    {i > 0 && <View className="h-2" />}
                    <SettingsRow
                      icon={item.icon}
                      label={item.label}
                      tint={item.tint}
                      iconColor={item.iconColor}
                      onPress={() => item.route && router.push(item.route)}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}

          {__DEV__ ? (
            <Button
              variant="secondary"
              label="Switch role (debug)"
              icon="swap-horiz"
              onPress={handleLogout}
              fullWidth
              accessibilityLabel="Switch role debug"
              className="mb-3"
            />
          ) : null}
          <Button variant="destructive" label="Sign out" icon="logout" onPress={handleLogout} fullWidth accessibilityLabel="Sign out" />
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}