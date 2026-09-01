import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import Button from '../../src/components/ui/Button';
import MaterialIcon from '../../src/components/ui/MaterialIcon';
import Screen from '../../src/components/ui/Screen';
import { useAuthStore } from '../../src/stores/authStore';

const SETTINGS = [
  { icon: 'notifications', label: 'Push notifications', value: 'On' },
  { icon: 'mail', label: 'Email digests', value: 'Weekly' },
  { icon: 'dark_mode', label: 'Theme', value: 'Light' },
  { icon: 'download', label: 'Download content', value: '' },
  { icon: 'delete', label: 'Clear cache', value: '' },
];

/** Shared settings screen (settings). */
export default function SettingsScreen() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <View className="flex-1 bg-background" accessibilityLabel="Settings">
      <Screen>
        <View className="flex-row items-center gap-3 px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Button>
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">Settings</Text>
        </View>

        <View className="px-[24px]">
          <View className="bg-surface-container-lowest rounded-2xl border border-surface-variant/50 overflow-hidden mb-6">
            {SETTINGS.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={() => {}}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-surface-container-low ${i > 0 ? 'border-t border-[#eff4ff]' : ''}`}
              >
                <MaterialIcon name={item.icon} size={22} color="on-surface-variant" />
                <Text className="flex-1 font-body-md text-body-md text-on-surface">{item.label}</Text>
                {item.value ? <Text className="font-label-sm text-label-sm text-primary">{item.value}</Text> : null}
                <MaterialIcon name="chevron_right" size={18} color="outline" />
              </Pressable>
            ))}
          </View>
          <Button variant="destructive" label="Sign out" icon="logout" onPress={() => { logout(); router.replace('/(auth)/login'); }} fullWidth accessibilityLabel="Sign out" />
        </View>
      </Screen>
    </View>
  );
}
