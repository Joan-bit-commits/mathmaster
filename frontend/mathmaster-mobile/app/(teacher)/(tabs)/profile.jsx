import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import Button from '../../../src/components/ui/Button';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import Screen from '../../../src/components/ui/Screen';
import { useAuthStore } from '../../../src/stores/authStore';

const SECTIONS = [
  {
    title: 'Teaching',
    items: [
      { icon: 'menu_book', label: 'Curriculum', route: '/(teacher)/(tabs)/curriculum' },
      { icon: 'groups', label: 'Students', route: '/(teacher)/(tabs)/students' },
      { icon: 'add_box', label: 'Authoring hub', route: '/(teacher)/(tabs)/content' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: 'person', label: 'Edit profile', route: '/(shared)/edit-profile' },
      { icon: 'lock', label: 'Change password', route: '/(shared)/change-password' },
    ],
  },
  {
    title: 'App',
    items: [
      { icon: 'settings', label: 'Settings', route: '/(shared)/settings' },
      { icon: 'notifications', label: 'Notifications', route: '/(shared)/notifications' },
    ],
  },
];

export default function TeacherProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-background" accessibilityLabel="Teacher profile">
      <Screen>
        <ScrollView contentContainerClassName="px-[24px] pb-10" showsVerticalScrollIndicator={false}>
          <View className="items-center py-6">
            <Text className="text-6xl mb-3">👩🏽‍🏫</Text>
            <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">
              {user?.first_name || user?.username || 'Teacher'}
            </Text>
            <Text className="font-label-sm text-label-sm text-on-surface-variant mt-1">Mathematics · S1–S6</Text>
          </View>

          {SECTIONS.map((section) => (
            <View key={section.title} className="mb-6">
              <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2 px-1">{section.title}</Text>
              <View className="bg-surface-container-lowest rounded-2xl border border-surface-variant/50 overflow-hidden">
                {section.items.map((item, i) => (
                  <Pressable
                    key={item.label}
                    onPress={() => item.route && router.push(item.route)}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-surface-container-low ${i > 0 ? 'border-t border-[#eff4ff]' : ''}`}
                  >
                    <MaterialIcon name={item.icon} size={22} color="on-surface-variant" />
                    <Text className="flex-1 font-body-md text-body-md text-on-surface">{item.label}</Text>
                    <MaterialIcon name="chevron_right" size={20} color="outline" />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {__DEV__ ? (
            <Button variant="secondary" label="Switch role (debug)" icon="swap-horiz" onPress={handleLogout} fullWidth accessibilityLabel="Switch role debug" className="mb-3" />
          ) : null}
          <Button variant="destructive" label="Sign out" icon="logout" onPress={handleLogout} fullWidth accessibilityLabel="Sign out" />
        </ScrollView>
      </Screen>
    </View>
  );
}
