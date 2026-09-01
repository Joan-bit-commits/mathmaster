import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import Card from '../../../src/components/ui/Card';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import Screen from '../../../src/components/ui/Screen';

const ACTIONS = [
  { icon: 'menu_book', label: 'Topics', blurb: 'Browse & edit topics', route: '/(teacher)/(tabs)/curriculum' },
  { icon: 'article', label: 'Lessons', blurb: 'Manage lesson content', route: '/(teacher)/content/lesson/new' },
  { icon: 'quiz', label: 'Quizzes', blurb: 'Build & review quizzes', route: '/(teacher)/content/quiz/new' },
];

const ACTIVITY = [
  { icon: 'add-circle', text: 'You added "Trigonometry Quiz 2"', time: '2h ago' },
  { icon: 'edit', text: 'You edited "Linear Equations" lesson', time: 'Yesterday' },
  { icon: 'upload_file', text: 'Bulk-imported 12 questions', time: '3 days ago' },
];

export default function AuthoringHubScreen() {
  return (
    <View className="flex-1 bg-background" accessibilityLabel="Authoring hub">
      <Screen>
        <View className="px-[24px] pt-4 pb-2">
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">Content</Text>
        </View>
        <ScrollView contentContainerClassName="px-[24px] pb-28" showsVerticalScrollIndicator={false}>
          <View className="gap-3 mb-8">
            {ACTIONS.map((a) => (
              <Card key={a.label} onPress={() => router.push(a.route)} accessibilityLabel={a.label}>
                <View className="flex-row items-center gap-4">
                  <View className="w-14 h-14 rounded-2xl bg-[#c9e6ff] items-center justify-center">
                    <MaterialIcon name={a.icon} size={26} color="primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[24px] leading-8 font-semibold text-on-surface">{a.label}</Text>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">{a.blurb}</Text>
                  </View>
                  <MaterialIcon name="chevron_right" size={22} color="on-surface-variant" />
                </View>
              </Card>
            ))}
          </View>

          <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface mb-3">Recent activity</Text>
          {ACTIVITY.map((a, i) => (
            <View key={i} className="flex-row items-center gap-3 mb-3">
              <MaterialIcon name={a.icon} size={20} color="primary" />
              <View className="flex-1">
                <Text className="font-body-sm text-body-sm text-on-surface">{a.text}</Text>
              </View>
              <Text className="font-label-sm text-label-sm text-on-surface-variant">{a.time}</Text>
            </View>
          ))}
        </ScrollView>

        <Pressable
          onPress={() => router.push('/(teacher)/content/topic/new')}
          accessibilityRole="button"
          accessibilityLabel="Quick add"
          className="absolute bottom-6 right-6 px-4 h-14 rounded-2xl bg-primary flex-row items-center gap-2 shadow-level-2"
        >
          <MaterialIcon name="add" size={24} color="on-primary" />
          <Text className="font-label-sm text-label-sm text-on-primary">Quick add</Text>
        </Pressable>
      </Screen>
    </View>
  );
}
