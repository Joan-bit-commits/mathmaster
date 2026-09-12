import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import AttemptRow from '../../../src/components/ui/AttemptRow';
import CaptureFAB from '../../../src/components/ui/CaptureFAB';
import Card from '../../../src/components/ui/Card';
import CircularProgress from '../../../src/components/ui/CircularProgress';
import LevelTabs from '../../../src/components/ui/LevelTabs';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import Screen from '../../../src/components/ui/Screen';
import StatCard from '../../../src/components/ui/StatCard';
import TopicMasteryRow from '../../../src/components/ui/TopicMasteryRow';
import { usePerformance, useTopicPerformance } from '../../../src/hooks';
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';
import { friendlyDate } from '../../../src/lib/format';

const PERIODS = ['7 days', '30 days', 'All time'];
const PERIOD_KEYS = { '7 days': '7d', '30 days': '30d', 'All time': 'all' };

const ATTEMPTS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: ['Algebra Quiz', 'Number Bases Quiz', 'Geometry Quiz', 'Sets Quiz', 'Statistics Quiz', 'Trig Quiz'][i],
  score: [82, 91, 64, 58, 75, 45][i],
  date: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
}));

export default function PerformanceScreen() {
  const [periodLabel, setPeriodLabel] = useState('All time');
  const period = PERIOD_KEYS[periodLabel];
  const { data: summary, isLoading } = usePerformance(period);
  const { data: topics } = useTopicPerformance();
  const tabBarSpacing = useTabBarSpacing();

  const mastery = summary?.average_score ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Performance analytics">
      <Screen>
        <View className="px-[24px] pt-4 pb-2 flex-row items-center justify-between">
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">
            Performance
          </Text>
          <Pressable
            onPress={() => router.push('/(student)/performance/all')}
            accessibilityRole="button"
            accessibilityLabel="Detailed performance"
            hitSlop={8}
          >
            <MaterialIcon name="bar_chart" size={22} color="primary" />
          </Pressable>
        </View>

        {isLoading ? (
          <View className="px-[24px] gap-3">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </View>
        ) : (
          <ScrollView
            contentContainerClassName="px-[24px]"
            contentContainerStyle={{ paddingBottom: tabBarSpacing + 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero: mastery ring — the one deliberate visual moment */}
            <Card variant="hero" className="items-center mb-6 py-6">
              <CircularProgress value={mastery} label="Overall mastery" />
              <Text className="font-body-sm text-body-sm text-[#b6c2d2] mt-3">
                {summary?.quizzes_taken ?? 0} quizzes taken · streak 🔥 {summary?.current_streak_days ?? 0} days
              </Text>
            </Card>

            <LevelTabs options={PERIODS} value={periodLabel} onChange={setPeriodLabel} />

            {/* Stat tiles */}
            <View className="flex-row gap-3 mb-3 px-[1px]">
              <StatCard icon="article" label="Lessons" value={summary?.lessons_completed ?? 0} tone="primary" />
              <StatCard icon="quiz" label="Quizzes" value={summary?.quizzes_taken ?? 0} tone="secondary" />
            </View>
            <View className="flex-row gap-3 mb-6 px-[1px]">
              <StatCard icon="star" label="Avg score" value={`${summary?.average_score ?? 0}%`} tone="tertiary" />
              <StatCard
                icon="schedule"
                label="Time"
                value={`${Math.round((summary?.time_spent_minutes ?? 0) / 60)}h`}
                tone="primary"
              />
            </View>

            {/* Topic mastery */}
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-2 h-2 rounded-full bg-primary" />
              <Text className="text-[16px] leading-6 font-semibold text-on-surface">Topic mastery</Text>
            </View>
            {(topics || []).map((t, i) => (
              <Animated.View key={t.topic_id} entering={FadeInDown.delay(i * 50).duration(300)}>
                <TopicMasteryRow name={t.topic_name} score={t.average_score} index={i} />
              </Animated.View>
            ))}

            {/* Recent attempts */}
            <View className="flex-row items-center gap-2 mb-3 mt-2">
              <View className="w-2 h-2 rounded-full bg-secondary" />
              <Text className="text-[16px] leading-6 font-semibold text-on-surface">Recent attempts</Text>
            </View>
            {ATTEMPTS.map((a) => (
              <AttemptRow key={a.id} title={a.title} score={a.score} date={friendlyDate(a.date)} />
            ))}
          </ScrollView>
        )}
      </Screen>
      <CaptureFAB
        className="absolute right-6"
        style={{ bottom: tabBarSpacing + 24 }}
        onPress={() => router.push('/(student)/scan/camera')}
      />
    </SafeAreaView>
  );
}