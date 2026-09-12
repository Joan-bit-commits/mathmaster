import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionPill from '../../../src/components/ui/ActionPill';
import Avatar from '../../../src/components/ui/Avatar';
import Card from '../../../src/components/ui/Card';
import LearningPathCard from '../../../src/components/ui/LearningPathCard';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import Screen from '../../../src/components/ui/Screen';
import SubjectTile from '../../../src/components/ui/SubjectTile';
import CaptureFAB from '../../../src/components/ui/CaptureFAB';
import { usePerformance, useRecommendations, useTopicPerformance, useTopics } from '../../../src/hooks';
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';
import { greeting } from '../../../src/lib/format';
import { useAuthStore } from '../../../src/stores/authStore';

const ACTIONS = [
  { icon: 'smart_toy', label: 'Ask AI', tint: '#c9e6ff', iconColor: '#003751', route: '/(student)/(tabs)/ai-tutor' },
  { icon: 'quiz', label: 'Daily quiz', tint: '#e1e0ff', iconColor: '#07006c', route: '/(student)/(tabs)/topics' },
  { icon: 'trending_up', label: 'Progress', tint: '#ffddb8', iconColor: '#4a2c00', route: '/(student)/(tabs)/performance' },
  { icon: 'photo_camera', label: 'Quick scan', tint: '#d5f5d5', iconColor: '#1d5c22', route: '/(student)/scan/camera' },
];

// Score -> mastery label for the hero pill. Thresholds match how
// performance.jsx and analytics.js already bucket scores elsewhere in the
// app, so "Intermediate" here means the same thing it means on the
// Performance tab.
function masteryTier(score) {
  if (score >= 80) return 'Advanced';
  if (score >= 50) return 'Intermediate';
  return 'Beginner';
}

export default function StudentHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const tabBarSpacing = useTabBarSpacing();

  // There's no notifications backend yet (no model, no endpoint — the
  // notifications screen itself is static placeholder content too), so
  // there's no real "unread" signal to show. Defaulting to false rather
  // than a hardcoded `true` that always claimed something unread existed.
  const hasUnreadNotifications = false;

  const { data: topics, isLoading: topicsLoading } = useTopics();
  const { data: topicPerformance } = useTopicPerformance();
  const { data: recommendations } = useRecommendations();
  const { data: summary } = usePerformance('all');

  const featured = (topics || []).slice(0, 5);
  const streakDays = summary?.current_streak_days ?? 0;

  // Best-performing topic drives the "⭐ Topic — Tier" hero pill. Only
  // shown once the student actually has attempts to derive it from —
  // no fabricated subject/level for a brand new account.
  const bestTopic = topicPerformance?.length
    ? [...topicPerformance].sort((a, b) => b.average_score - a.average_score)[0]
    : null;

  // "Continue learning" — prefer a topic the student has started but not
  // finished; fall back to the first not-yet-started topic; hide the
  // section entirely if there's nothing to show rather than invent one.
  const continueTopic =
    featured.find((t) => (t.progress ?? 0) > 0 && (t.progress ?? 0) < 100) ||
    featured.find((t) => (t.progress ?? 0) === 0);
  const continueTotalSteps = Math.max(1, Math.min(continueTopic?.lesson_count || 1, 8));
  const continueCurrentStep = Math.round(((continueTopic?.progress ?? 0) / 100) * continueTotalSteps);

  const recommended = (recommendations || []).map((r) => ({
    id: r.id,
    topicId: r.topic,
    name: r.topic_name,
    reason: r.recommendation_text,
  }));

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
                  🔥 {streakDays} day streak
                </Text>
              </View>
              {bestTopic && (
                <View className="bg-white/10 rounded-full px-4 py-2">
                  <Text className="font-label-sm text-label-sm text-[#ffb95f]">
                    ⭐ {bestTopic.topic_name} — {masteryTier(bestTopic.average_score)}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Continue learning */}
          {continueTopic && (
            <>
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-2 h-2 rounded-full bg-primary" />
                <Text className="text-[16px] leading-6 font-semibold text-on-surface">Continue</Text>
              </View>
              <LearningPathCard
                icon="functions"
                title={continueTopic.name}
                stepLabel={`${continueTopic.progress ?? 0}% complete · ${continueTopic.lesson_count || 0} lessons`}
                totalSteps={continueTotalSteps}
                currentStep={continueCurrentStep}
                onPress={() => router.push(`/(student)/topic/${continueTopic.id}`)}
              />
            </>
          )}

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
          {topicsLoading ? (
            <View className="flex-row gap-3">
              {[...Array(3)].map((_, i) => <LoadingSkeleton key={i} variant="card" className="w-40 h-32" />)}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pb-1 pr-2">
              {featured.map((t, i) => (
                <SubjectTile
                  key={t.id}
                  name={t.name}
                  level={t.level}
                  progress={t.progress || 0}
                  index={i}
                  onPress={() => router.push(`/(student)/topic/${t.id}`)}
                />
              ))}
            </ScrollView>
          )}

          {/* Recommended */}
          {recommended.length > 0 && (
            <>
              <View className="flex-row items-center gap-2 mt-8 mb-3">
                <View className="w-2 h-2 rounded-full bg-tertiary" />
                <Text className="text-[16px] leading-6 font-semibold text-on-surface">Recommended for you</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-2">
                {recommended.map((t) => (
                  <Card key={t.id} onPress={() => router.push(`/(student)/topic/${t.topicId}`)} className="w-64">
                    <View className="h-1 w-10 bg-tertiary-container rounded-full mb-3" />
                    <Text className="text-[18px] leading-6 font-semibold text-on-surface mb-1">{t.name}</Text>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">{t.reason}</Text>
                  </Card>
                ))}
              </ScrollView>
            </>
          )}
        </ScrollView>
      </Screen>
      <CaptureFAB className="absolute bottom-8 right-6" onPress={() => router.push('/(student)/scan/camera')} />
    </SafeAreaView>
  );
}