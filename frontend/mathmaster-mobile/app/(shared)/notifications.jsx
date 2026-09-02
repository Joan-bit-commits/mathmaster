import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../src/components/ui/Button';
import MaterialIcon from '../../src/components/ui/MaterialIcon';
import Screen from '../../src/components/ui/Screen';
import { friendlyDate } from '../../src/lib/format';

const GROUPS = [
  {
    title: 'Today',
    items: [
      { icon: 'emoji_events', text: 'New badge: 7-day streak! 🔥', time: new Date().toISOString(), unread: true },
      { icon: 'quiz', text: 'Daily quiz is ready for Algebra', time: new Date().toISOString(), unread: true },
    ],
  },
  {
    title: 'Yesterday',
    items: [
      { icon: 'smart_toy', text: 'Your AI tutor conversation was saved', time: new Date(Date.now() - 86400000).toISOString(), unread: false },
    ],
  },
  {
    title: 'Earlier',
    items: [
      { icon: 'star', text: 'You scored 91% on Number Bases Quiz', time: new Date(Date.now() - 5 * 86400000).toISOString(), unread: false },
    ],
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Notifications">
      <Screen>
        <View className="flex-row items-center justify-between px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Button>
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">Notifications</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Mark all read">
            <Text className="font-label-sm text-label-sm text-primary">Mark all read</Text>
          </Pressable>
        </View>

        {GROUPS.map((group) => (
          <View key={group.title} className="px-[24px] mb-6">
            <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">{group.title}</Text>
            {group.items.map((item, i) => (
              <View
                key={i}
                className={`flex-row items-center gap-3 bg-surface-container-lowest rounded-2xl p-4 border border-surface-variant/50 mb-2 ${item.unread ? 'border-l-4 border-l-primary' : ''}`}
                accessibilityLabel={item.text}
              >
                <MaterialIcon name={item.icon} size={22} color="primary" />
                <View className="flex-1">
                  <Text className="font-body-sm text-body-sm text-on-surface">{item.text}</Text>
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">{friendlyDate(item.time)}</Text>
                </View>
                {item.unread ? <View className="w-2 h-2 rounded-full bg-primary" /> : null}
              </View>
            ))}
          </View>
        ))}
      </Screen>
    </SafeAreaView>
  );
}
