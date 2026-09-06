import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionPill from '../../../src/components/ui/ActionPill';
import Avatar from '../../../src/components/ui/Avatar';
import Card from '../../../src/components/ui/Card';
import LearningPathCard from '../../../src/components/ui/LearningPathCard';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import Screen from '../../../src/components/ui/Screen';
import StreakGoalRing from '../../../src/components/ui/StreakGoalRing';
import SubjectTile from '../../../src/components/ui/SubjectTile';
import CaptureFAB from '../../../src/components/ui/CaptureFAB';
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';
import { greeting } from '../../../src/lib/format';
import { useAuthStore } from '../../../src/stores/authStore';

const ACTIONS = [
  { icon: 'smart_toy', label: 'Ask AI', tint: '#c9e6ff', iconColor: '#003751', route: '/(student)/(tabs)/ai-tutor' },
  { icon: 'quiz', label: 'Daily quiz', tint: '#e1e0ff', iconColor: '#07006c', route: '/(student)/(tabs)/topics' },
  { icon: 'trending_up', label: 'Progress', tint: '#ffddb8', iconColor: '#4a2c00', route: '/(student)/(tabs)/performance' },
  { icon: 'photo_camera', label: 'Quick scan', tint: '#d5f5d5', iconColor: '#1d5c22', route: '/(student)/scan/camera' },
];

export default function StudentHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const hasUnreadNotifications = true; // TODO: wire to real notifications state
  const tabBarSpacing = useTabBarSpacing();

  const featured = [
    { id: 1, name: 'Algebra', level: 'S3', progress: 60 },
    { id: 2, name: 'Number & Numeration', level: 'S2', progress: 100 },
    { id: 3, name: 'Geometry & Measurement', level: 'S3', progress: 30 },
  ];

  const recommended = [
    { id: 5, name: 'Statistics & Probability', reason: 'Your score dipped to 58%' },
    { id: 6, name: 'Trigonometry', reason: 'New topic for S3' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Student home dashboard">
      <Screen>
        {/* Top app bar */}
        <View className="flex-row items-center justify-between h-16 px-[24px]">
          <Pressable onPress={() => router.push('/(shared)/edit-profile')} accessibilityRole="button" accessibilityLabel="Open profile">
            <Avatar name={user?.username || 'A'} size="sm" />
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
          {/* Hero card */}
          <Card
            variant="hero"
            className="min-h-[160px] justify-between relative overflow-hidden mb-6"
          >
            <View className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-primary opacity-10" />
            <View>
              <Text className="text-[28px] leading-9 font-semibold text-white mb-1">
                {greeting()}, {user?.first_name || "Alex"} 👋
              </Text>
              <Text className="text-[16px] leading-6 text-[#b6c2d2]">
                Ready to keep your streak alive?
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-3 mt-4">
              <View className="bg-white/10 rounded-full px-4 py-2">
                <Text className="font-label-sm text-label-sm text-[#89ceff]">
                  🔥 8 day streak
                </Text>
              </View>
              <View className="bg-white/10 rounded-full px-4 py-2">
                <Text className="font-label-sm text-label-sm text-[#ffb95f]">
                  ⭐ Algebra — Intermediate
                </Text>
              </View>
            </View>
          </Card>

          {/* Continue learning */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-2 h-2 rounded-full bg-primary" />
            <Text className="text-[16px] leading-6 font-semibold text-on-surface">Continue</Text>
          </View>
          <LearningPathCard
            icon="functions"
            title="Linear Equations"
            stepLabel="Lesson 3 of 5"
            totalSteps={5}
            currentStep={2}
            onPress={() => router.push('/(student)/lesson/13')}
          />

          {/* Quick actions — horizontal pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 mb-8" contentContainerClassName="pr-2">
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

          {/* Your subjects */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-secondary" />
              <Text className="text-[16px] leading-6 font-semibold text-on-surface">Your subjects</Text>
            </View>
            <Pressable onPress={() => router.push('/(student)/(tabs)/topics')} accessibilityRole="button" accessibilityLabel="See all subjects">
              <Text className="font-label-sm text-label-sm text-primary">See all</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pb-1 pr-2">
            {featured.map((t, i) => (
              <SubjectTile
                key={t.id}
                name={t.name}
                level={t.level}
                progress={t.progress}
                index={i}
                onPress={() => router.push(`/(student)/topic/${t.id}`)}
              />
            ))}
          </ScrollView>

          {/* Recommended */}
          <View className="flex-row items-center gap-2 mt-8 mb-3">
            <View className="w-2 h-2 rounded-full bg-tertiary" />
            <Text className="text-[16px] leading-6 font-semibold text-on-surface">Recommended for you</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-2">
            {recommended.map((t) => (
              <Card key={t.id} onPress={() => router.push(`/(student)/topic/${t.id}`)} className="w-64">
                <View className="h-1 w-10 bg-tertiary-container rounded-full mb-3" />
                <Text className="text-[18px] leading-6 font-semibold text-on-surface mb-1">{t.name}</Text>
                <Text className="font-body-sm text-body-sm text-on-surface-variant">{t.reason}</Text>
              </Card>
            ))}
          </ScrollView>
        </ScrollView>
      </Screen>
      <CaptureFAB className="absolute bottom-8 right-6" onPress={() => router.push('/(student)/scan/camera')} />
    </SafeAreaView>
  );
}