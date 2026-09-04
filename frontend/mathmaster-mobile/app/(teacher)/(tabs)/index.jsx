import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import Avatar from '../../../src/components/ui/Avatar';
import Card from '../../../src/components/ui/Card';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import Screen from '../../../src/components/ui/Screen';
import StatTile from '../../../src/components/ui/StatTile';
import { greeting } from '../../../src/lib/format';
import { useTeacherOverview } from '../../../src/hooks';
import { useAuthStore } from '../../../src/stores/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeacherDashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: overview } = useTeacherOverview();

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Teacher dashboard">
      <Screen>
        <View className="flex-row items-center justify-between h-16 px-[24px]">
          <MaterialIcon name="menu" size={24} color="on-surface-variant" />
          <Text className="text-[28px] leading-9 font-semibold text-primary tracking-tight">MathMaster</Text>
          <Pressable onPress={() => router.push('/(shared)/edit-profile')} accessibilityRole="button" accessibilityLabel="Open profile">
            <Avatar name={user?.username || 'T'} size="md" className="border-2 border-primary" />
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="px-[24px] pb-8" showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <Card variant="hero" className="mb-6">
            <Text className="text-[24px] leading-8 font-semibold text-white mb-1">{greeting()}, {user?.first_name || 'Teacher'} 👋</Text>
            <Text className="font-body-sm text-body-sm text-[#b6c2d2] mb-4">Here's how your classes are doing today.</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-white/10 rounded-xl p-3 border border-white/10">
                <Text className="font-label-sm text-label-sm text-[#89ceff] uppercase">Coverage</Text>
                <Text className="text-[24px] leading-8 font-bold text-white">{overview?.coverage?.quizzes ? Math.round((overview.coverage.quizzes / (overview.coverage.lessons || 1)) * 100) : 100}%</Text>
              </View>
              <View className="flex-1 bg-white/10 rounded-xl p-3 border border-white/10">
                <Text className="font-label-sm text-label-sm text-[#ffb95f] uppercase">Active 7d</Text>
                <Text className="text-[24px] leading-8 font-bold text-white">{overview?.active_7d ?? 0}</Text>
              </View>
            </View>
          </Card>

          {/* 4-card stat grid */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            <StatTile icon="menu_book" label="Topics" value={overview?.coverage?.topics ?? 0} />
            <StatTile icon="article" label="Lessons" value={overview?.coverage?.lessons ?? 0} />
            <StatTile icon="quiz" label="Quizzes" value={overview?.coverage?.quizzes ?? 0} />
            <StatTile icon="groups" label="Students" value={overview?.total_students ?? 0} />
          </View>

          {/* Curriculum coverage */}
          <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface mb-3">Curriculum coverage</Text>
          {[
            { name: 'Algebra (S1–S4)', pct: 85 },
            { name: 'Geometry (S1–S2)', pct: 70 },
            { name: 'Trigonometry (S3–S4)', pct: 45 },
          ].map((c) => (
            <View key={c.name} className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="font-body-sm text-body-sm text-on-surface">{c.name}</Text>
                <Text className="font-label-sm text-label-sm text-on-surface-variant">{c.pct}%</Text>
              </View>
              <ProgressBar value={c.pct} />
            </View>
          ))}

          {/* Content gaps */}
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

          {/* Quick actions */}
          <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface mb-3">Quick actions</Text>
          <View className="flex-row gap-3">
            {[
              { icon: 'add-box', label: 'New topic', route: '/(teacher)/content/topic/new' },
              { icon: 'article', label: 'New lesson', route: '/(teacher)/content/lesson/new' },
              { icon: 'quiz', label: 'New quiz', route: '/(teacher)/content/quiz/new' },
            ].map((a) => (
              <Card key={a.label} onPress={() => router.push(a.route)} className="flex-1 items-center py-4" accessibilityLabel={a.label}>
                <MaterialIcon name={a.icon} size={24} color="primary" />
                <Text className="font-label-sm text-label-sm text-on-surface mt-2 text-center">{a.label}</Text>
              </Card>
            ))}
          </View>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
