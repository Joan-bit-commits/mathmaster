import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionPill from '../../../src/components/ui/ActionPill';
import Avatar from '../../../src/components/ui/Avatar';
import Card from '../../../src/components/ui/Card';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import Screen from '../../../src/components/ui/Screen';
import StatTile from '../../../src/components/ui/StatTile';
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';
import { greeting } from '../../../src/lib/format';
import { useTeacherOverview } from '../../../src/hooks';
import { useAuthStore } from '../../../src/stores/authStore';

const ACTIONS = [
  { icon: 'add-box', label: 'New topic', tint: '#c9e6ff', iconColor: '#003751', route: '/(teacher)/content/topic/new' },
  { icon: 'article', label: 'New lesson', tint: '#e1e0ff', iconColor: '#07006c', route: '/(teacher)/content/lesson/new' },
  { icon: 'quiz', label: 'New quiz', tint: '#ffddb8', iconColor: '#4a2c00', route: '/(teacher)/content/quiz/new' },
];

export default function TeacherDashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: overview } = useTeacherOverview();
  const hasUnreadNotifications = true; // TODO: wire to real notifications state
  const tabBarSpacing = useTabBarSpacing();

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Teacher dashboard">
      <Screen>
        {/* Top app bar — matches student dashboard */}
        <View className="flex-row items-center justify-between h-16 px-[24px]">
          <Pressable onPress={() => router.push('/(shared)/edit-profile')} accessibilityRole="button" accessibilityLabel="Open profile">
            <Avatar name={user?.username || 'T'} size="sm" />
          </Pressable>
          <Text className="text-[20px] leading-7 font-bold text-primary tracking-tight">MathMaster</Text>
          <Pressable
            onPress={() => router.push('/(shared)/notifications')}
            accessibilityRole="button"
            accessibilityLabel="View notifications"
            className="w-10 h-10 items-center justify-center"
          >
            <MaterialIcon name="notifications" size={24} color="on-surface-variant" />
            {hasUnreadNotifications && <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />}
          </Pressable>
        </View>

        <ScrollView
          contentContainerClassName="px-[24px]"
          contentContainerStyle={{ paddingBottom: tabBarSpacing + 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero card — same structure as student */}
          <Card variant="hero" className="min-h-[160px] justify-between relative overflow-hidden mb-6">
            <View className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-primary opacity-10" />
            <View>
              <Text className="text-[28px] leading-9 font-semibold text-white mb-1">
                {greeting()}, {user?.first_name || 'Teacher'} 👋
              </Text>
              <Text className="text-[16px] leading-6 text-[#b6c2d2]">
                Here's how your classes are doing today.
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-3 mt-4">
              <View className="bg-white/10 rounded-full px-4 py-2">
                <Text className="font-label-sm text-label-sm text-[#89ceff]">
                  👥 {overview?.active_7d ?? 0} active this week
                </Text>
              </View>
              <View className="bg-white/10 rounded-full px-4 py-2">
                <Text className="font-label-sm text-label-sm text-[#ffb95f]">
                  📚 {overview?.coverage?.topics ?? 0} topics published
                </Text>
              </View>
            </View>
          </Card>

          {/* Stats — 4-card grid */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-2 h-2 rounded-full bg-primary" />
            <Text className="text-[16px] leading-6 font-semibold text-on-surface">Overview</Text>
          </View>
          <View className="flex-row flex-wrap gap-3 mb-6">
            <View className="w-[48%]"><StatTile icon="menu_book" label="Topics" value={overview?.coverage?.topics ?? 0} /></View>
            <View className="w-[48%]"><StatTile icon="article" label="Lessons" value={overview?.coverage?.lessons ?? 0} /></View>
            <View className="w-[48%]"><StatTile icon="quiz" label="Quizzes" value={overview?.coverage?.quizzes ?? 0} /></View>
            <View className="w-[48%]"><StatTile icon="groups" label="Students" value={overview?.total_students ?? 0} /></View>
          </View>

          {/* Quick actions — horizontal pills like student */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8" contentContainerClassName="pr-2">
            {ACTIONS.map((a) => (
              <ActionPill
                key={a.label}
                icon={a.icon}
                label={a.label}
                tint={a.tint}
                iconColor={a.iconColor}
                onPress={() => router.push(a.route)}
              />
            ))}
          </ScrollView>

          {/* Curriculum coverage */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-secondary" />
              <Text className="text-[16px] leading-6 font-semibold text-on-surface">Curriculum coverage</Text>
            </View>
            <Pressable onPress={() => router.push('/(teacher)/(tabs)/curriculum')} accessibilityRole="button" accessibilityLabel="See all curriculum">
              <Text className="font-label-sm text-label-sm text-primary">See all</Text>
            </Pressable>
          </View>
          <Card className="mb-6 p-4">
            {[
              { name: 'Algebra (S1–S4)', pct: 85 },
              { name: 'Geometry (S1–S2)', pct: 70 },
              { name: 'Trigonometry (S3–S4)', pct: 45 },
            ].map((c) => (
              <View key={c.name} className="mb-3 last:mb-0">
                <View className="flex-row justify-between mb-1">
                  <Text className="font-body-sm text-body-sm text-on-surface">{c.name}</Text>
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">{c.pct}%</Text>
                </View>
                <ProgressBar value={c.pct} />
              </View>
            ))}
          </Card>

          {/* Content gaps */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-2 h-2 rounded-full bg-tertiary" />
            <Text className="text-[16px] leading-6 font-semibold text-on-surface">Needs attention</Text>
          </View>
          <Card className="mb-6 bg-[#ffddb8] border-0">
            <View className="flex-row items-center gap-3">
              <MaterialIcon name="warning" size={24} color="#653e00" />
              <View className="flex-1">
                <Text className="text-[18px] leading-6 font-semibold text-[#653e00]">Content gaps</Text>
                <Text className="font-body-sm text-body-sm text-[#653e00]">
                  {(overview?.top_struggling_topics || []).map((t) => t.topic_name).join(', ') || 'None detected'} need more questions.
                </Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
