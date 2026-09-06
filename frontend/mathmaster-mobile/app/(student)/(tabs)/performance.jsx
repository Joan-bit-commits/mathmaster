import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Card from '../../../src/components/ui/Card';
import CircularProgress from '../../../src/components/ui/CircularProgress';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import Screen from '../../../src/components/ui/Screen';
import StatTile from '../../../src/components/ui/StatTile';
import { usePerformance, useTopicPerformance } from '../../../src/hooks';
import { friendlyDate } from '../../../src/lib/format';
import CaptureFAB from '../../../src/components/ui/CaptureFAB';

const PERIODS = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'all', label: 'All time' },
];

const ATTEMPTS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: ['Algebra Quiz', 'Number Bases Quiz', 'Geometry Quiz', 'Sets Quiz', 'Statistics Quiz', 'Trig Quiz'][i],
  score: [82, 91, 64, 58, 75, 45][i],
  date: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
}));

export default function PerformanceScreen() {
  const [period, setPeriod] = useState('all');
  const { data: summary, isLoading } = usePerformance(period);
  const { data: topics } = useTopicPerformance();

  const mastery = summary?.average_score ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Performance analytics">
      <Screen>
        <View className="px-[24px] pt-4 pb-2 flex-row items-center justify-between">
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">Performance</Text>
          <Pressable onPress={() => router.push('/(student)/performance/all')} accessibilityRole="button" accessibilityLabel="Detailed performance">
            <MaterialIcon name="bar-chart" size={22} color="primary" />
          </Pressable>
        </View>

        {isLoading ? (
          <View className="px-[24px] gap-3">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </View>
        ) : (
          <ScrollView contentContainerClassName="px-[24px] pb-8" showsVerticalScrollIndicator={false}>
            {/* Hero: mastery ring */}
            <Card variant="hero" className="items-center mb-6 py-6">
              <CircularProgress value={mastery} label="Overall mastery" />
              <Text className="font-body-sm text-body-sm text-[#b6c2d2] mt-3">
                {summary?.quizzes_taken ?? 0} quizzes taken · streak 🔥 {summary?.current_streak_days ?? 0} days
              </Text>
            </Card>

            {/* Period selector */}
            <View className="flex-row gap-2 mb-4">
              {PERIODS.map((p) => (
                <Pressable
                  key={p.key}
                  onPress={() => setPeriod(p.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Period ${p.label}`}
                  accessibilityState={{ selected: period === p.key }}
                  className={`px-4 py-2 rounded-full border ${period === p.key ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-lowest'}`}
                >
                  <Text className={`font-label-sm text-label-sm ${period === p.key ? 'text-primary' : 'text-on-surface-variant'}`}>{p.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Stat tiles */}
            <View className="flex-row gap-3 mb-6">
              <StatTile icon="article" label="Lessons" value={summary?.lessons_completed ?? 0} />
              <StatTile icon="quiz" label="Quizzes" value={summary?.quizzes_taken ?? 0} />
            </View>
            <View className="flex-row gap-3 mb-6">
              <StatTile icon="star" label="Avg score" value={`${summary?.average_score ?? 0}%`} />
              <StatTile icon="schedule" label="Time" value={`${Math.round((summary?.time_spent_minutes ?? 0) / 60)}h`} />
            </View>

            {/* Topic mastery bars */}
            <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface mb-3">Topic mastery</Text>
            {(topics || []).map((t, i) => (
              <Animated.View key={t.topic_id} entering={FadeInDown.delay(i * 50).duration(300)} className="mb-4">
                <View className="flex-row justify-between mb-1">
                  <Text className="font-body-sm text-body-sm text-on-surface">{t.topic_name}</Text>
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">{t.average_score}%</Text>
                </View>
                <ProgressBar value={t.average_score} />
              </Animated.View>
            ))}

            {/* Recent attempts */}
            <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface mb-3 mt-2">Recent attempts</Text>
            {(ATTEMPTS || []).map((a) => (
              <Card key={a.id} variant="flat" className="mb-2">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-body-md text-body-md text-on-surface">{a.title}</Text>
                    <Text className="font-label-sm text-label-sm text-on-surface-variant">{friendlyDate(a.date)}</Text>
                  </View>
                  <Text className={`text-[18px] font-bold ${a.score >= 70 ? 'text-success' : a.score >= 50 ? 'text-[#b26a00]' : 'text-error'}`}>{a.score}%</Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        )}
      </Screen>
      <CaptureFAB className="absolute bottom-8 right-6" onPress={() => router.push('/(student)/scan/camera')} />
    </SafeAreaView>
  );
}
