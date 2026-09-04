import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Button from '../../src/components/ui/Button';
import MaterialIcon from '../../src/components/ui/MaterialIcon';
import Screen from '../../src/components/ui/Screen';
import { friendlyDate } from '../../src/lib/format';

const GROUPS = [
  {
    title: 'Today',
    items: [
      { icon: 'emoji_events', text: 'New badge: 7-day streak! 🔥', time: new Date().toISOString(), unread: true, celebratory: true },
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

function NotificationRow({ item, delay }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      className={`flex-row items-center gap-3 bg-surface-container-lowest rounded-2xl p-4 shadow-level-1 mb-2 ${item.unread ? 'border-l-4 border-l-primary' : ''}`}
      accessibilityLabel={item.text}
    >
      {item.celebratory ? (
        <View className="w-9 h-9 items-center justify-center">
          <LottieView
            source={require('../../assets/lottie/badge-burst.json')}
            autoPlay
            loop={false}
            style={{ width: 44, height: 44 }}
          />
        </View>
      ) : (
        <View className="w-9 h-9 items-center justify-center">
          <MaterialIcon name={item.icon} size={22} color="primary" />
        </View>
      )}
      <View className="flex-1">
        <Text className="font-body-sm text-body-sm text-on-surface">{item.text}</Text>
        <Text className="font-label-sm text-label-sm text-on-surface-variant">{friendlyDate(item.time)}</Text>
      </View>
      {item.unread ? <View className="w-2 h-2 rounded-full bg-primary" /> : null}
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-[24px] -mt-10">
      <LottieView
        source={require('../../assets/lottie/empty-inbox.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
      <Text className="text-[20px] leading-7 font-semibold text-on-surface text-center mt-2">
        You're all caught up
      </Text>
      <Text className="font-body-sm text-body-sm text-on-surface-variant text-center mt-1">
        New notifications will show up here.
      </Text>
    </View>
  );
}

export default function NotificationsScreen() {
  const hasNotifications = GROUPS.some((g) => g.items.length > 0);

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Notifications">
      <Screen>
        <View className="flex-row items-center justify-between px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Button>
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">
            Notifications
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Mark all read">
            <Text className="font-label-sm text-label-sm text-primary">Mark all read</Text>
          </Pressable>
        </View>

        {hasNotifications ? (
          GROUPS.map((group) => (
            <View key={group.title} className="px-[24px] mb-6">
              <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">{group.title}</Text>
              {group.items.map((item, i) => (
                <NotificationRow key={i} item={item} delay={i * 60} />
              ))}
            </View>
          ))
        ) : (
          <EmptyState />
        )}
      </Screen>
    </SafeAreaView>
  );
}