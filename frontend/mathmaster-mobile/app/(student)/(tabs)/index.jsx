import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import Avatar from '../../../src/components/ui/Avatar';
import Card from '../../../src/components/ui/Card';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import Screen from '../../../src/components/ui/Screen';
import Section from '../../../src/components/ui/Section';
import { greeting } from '../../../src/lib/format';
import { useTopics } from '../../../src/hooks';
import { useAuthStore } from '../../../src/stores/authStore';

const QUICK_ACTIONS = [
  { icon: 'smart_toy', label: 'Ask AI Tutor', color: '#e0f2fe', iconColor: '#0284c7', route: '/(student)/(tabs)/ai-tutor' },
  { icon: 'quiz', label: 'Daily Quiz', color: '#e1e0ff', iconColor: '#4648d4', route: '/(student)/(tabs)/topics' },
  { icon: 'trending_up', label: 'View Progress', color: '#d1fae5', iconColor: '#059669', route: '/(student)/(tabs)/performance' },
];

export default function StudentHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: topics, loading } = { data: null, loading: true };
  const featured = [
    { id: 1, name: 'Algebra', progress: 60 },
    { id: 2, name: 'Number & Numeration', progress: 100 },
    { id: 3, name: 'Geometry & Measurement', progress: 30 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Student home dashboard">
      <Screen>
        {/* Top app bar */}
        <View className="flex-row items-center justify-between h-16 px-[24px]">
          <MaterialIcon name="menu" size={24} color="on-surface-variant" />
          <Text className="text-[32px] leading-10 font-bold text-primary tracking-tight">MathMaster</Text>
          <Pressable onPress={() => router.push('/(shared)/edit-profile')} accessibilityRole="button" accessibilityLabel="Open profile">
            <Avatar name={user?.username || 'A'} size="md" className="border-2 border-primary" />
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="px-[24px] pb-8" showsVerticalScrollIndicator={false}>
          {/* Hero card */}
          <Card variant="hero" className="min-h-[160px] justify-between relative overflow-hidden">
            <View className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-primary opacity-20" style={{ filter: 'blur(60px)' }} />
            <View>
              <Text className="text-[28px] leading-9 font-semibold text-white mb-1">
                {greeting()}, {user?.first_name || 'Alex'} 👋
              </Text>
              <Text className="text-[16px] leading-6 text-[#b6c2d2]">Ready to keep your streak alive?</Text>
            </View>
            <View className="flex-row flex-wrap gap-3 mt-4">
              <View className="bg-white/10 rounded-full px-4 py-2 border border-white/10">
                <Text className="font-label-sm text-label-sm text-[#89ceff]">🔥 8 day streak</Text>
              </View>
              <View className="bg-white/10 rounded-full px-4 py-2 border border-white/10">
                <Text className="font-label-sm text-label-sm text-[#ffb95f]">⭐ Algebra — Intermediate</Text>
              </View>
            </View>
          </Card>

          {/* Continue learning */}
          <Section title="Continue where you left off" className="mt-6">
            <Card onPress={() => router.push('/(student)/lesson/13')} accessibilityLabel="Continue Linear Equations lesson 3 of 5">
              <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 rounded-xl bg-primary items-center justify-center">
                  <MaterialIcon name="functions" size={30} color="on-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-[24px] leading-8 font-semibold text-on-surface">Linear Equations</Text>
                  <Text className="font-body-sm text-body-sm text-on-surface-variant mt-1">Lesson 3 of 5</Text>
                </View>
                <View className="items-center justify-center">
                  <Text className="font-label-sm text-label-sm text-primary">60%</Text>
                </View>
              </View>
            </Card>
          </Section>

          {/* Quick actions */}
          <View className="flex-row gap-3 mb-8">
            {QUICK_ACTIONS.map((action, i) => (
              <Animated.View key={action.label} entering={FadeInDown.delay(i * 60).duration(300)} className="flex-1">
                <Card onPress={() => router.push(action.route)} className="items-center py-4" accessibilityLabel={action.label}>
                  <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: action.color }}>
                    <MaterialIcon name={action.icon} size={24} color={action.iconColor} />
                  </View>
                  <Text className="font-label-sm text-label-sm text-on-surface text-center leading-4">{action.label}</Text>
                </Card>
              </Animated.View>
            ))}
          </View>

          {/* Your topics grid */}
          <Section title="Your topics" actionLabel="See all" onAction={() => router.push('/(student)/(tabs)/topics')}>
            <View className="flex-row flex-wrap gap-3">
              {featured.map((t) => (
                <Card key={t.id} onPress={() => router.push(`/(student)/topic/${t.id}`)} className="w-[47%] flex-grow-0">
                  <View className="h-1 w-full bg-primary-container rounded-full mb-3" />
                  <Text className="font-label-sm text-label-sm text-primary uppercase mb-2">TOPIC</Text>
                  <Text className="text-[18px] leading-6 font-semibold text-on-surface mb-2">{t.name}</Text>
                  <ProgressBar value={t.progress} />
                  <Text className="font-label-sm text-label-sm text-on-surface-variant mt-2">{t.progress}% complete</Text>
                </Card>
              ))}
            </View>
          </Section>

          {/* Recommended */}
          <Section title="Recommended for you">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
              {[
                { id: 5, name: 'Statistics & Probability', reason: 'Your score dipped to 58%' },
                { id: 6, name: 'Trigonometry', reason: 'New topic for S3' },
              ].map((t) => (
                <Card key={t.id} onPress={() => router.push(`/(student)/topic/${t.id}`)} className="w-64">
                  <View className="h-1 w-10 bg-tertiary-container rounded-full mb-3" />
                  <Text className="text-[18px] leading-6 font-semibold text-on-surface mb-1">{t.name}</Text>
                  <Text className="font-body-sm text-body-sm text-on-surface-variant">{t.reason}</Text>
                </Card>
              ))}
            </ScrollView>
          </Section>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
