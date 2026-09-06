import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityItem from '../../../src/components/ui/ActivityItem';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import Screen from '../../../src/components/ui/Screen';
import ToolTile from '../../../src/components/ui/ToolTile';
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';

const ACTIONS = [
  { icon: 'menu_book', label: 'Topics', blurb: 'Browse & edit topics', route: '/(teacher)/(tabs)/curriculum' },
  { icon: 'article', label: 'Lessons', blurb: 'Manage lesson content', route: '/(teacher)/content/lesson/new' },
  { icon: 'quiz', label: 'Quizzes', blurb: 'Build & review quizzes', route: '/(teacher)/content/quiz/new' },
  { icon: 'upload_file', label: 'Past paper → Quiz', blurb: 'Extract questions from a paper', route: '/(teacher)/content/past-paper' },
];

const ACTIVITY = [
  { icon: 'add-circle', text: 'You added "Trigonometry Quiz 2"', time: '2h ago' },
  { icon: 'edit', text: 'You edited "Linear Equations" lesson', time: 'Yesterday' },
  { icon: 'upload_file', text: 'Bulk-imported 12 questions', time: '3 days ago' },
];

export default function AuthoringHubScreen() {
  const tabBarSpacing = useTabBarSpacing();

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Authoring hub">
      <Screen>
        <View className="px-[24px] pt-4 pb-2">
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">
            Content
          </Text>
          <Text className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Create and manage learning material</Text>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: tabBarSpacing + 24 }}
          contentContainerClassName="px-[24px]"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-3 mb-8">
            {ACTIONS.map((a, i) => (
              <ToolTile key={a.label} icon={a.icon} label={a.label} blurb={a.blurb} index={i} onPress={() => router.push(a.route)} />
            ))}
          </View>

          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-2 h-2 rounded-full bg-primary" />
            <Text className="text-[16px] leading-6 font-semibold text-on-surface">Recent activity</Text>
          </View>
          <View>
            {ACTIVITY.map((a, i) => (
              <ActivityItem key={i} icon={a.icon} text={a.text} time={a.time} isLast={i === ACTIVITY.length - 1} />
            ))}
          </View>
        </ScrollView>

        <Pressable
          onPress={() => router.push('/(teacher)/content/topic/new')}
          accessibilityRole="button"
          accessibilityLabel="Quick add"
          className="absolute right-6 px-4 h-14 rounded-2xl bg-primary flex-row items-center gap-2 shadow-level-2"
          style={{ bottom: tabBarSpacing + 24 }}
        >
          <MaterialIcon name="add" size={24} color="on-primary" />
          <Text className="font-label-sm text-label-sm text-on-primary">Quick add</Text>
        </Pressable>
      </Screen>
    </SafeAreaView>
  );
}