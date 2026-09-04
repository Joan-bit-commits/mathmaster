import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../../src/components/ui/Button';
import Card from '../../../src/components/ui/Card';
import ErrorState from '../../../src/components/ui/ErrorState';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import Screen from '../../../src/components/ui/Screen';
import StatTile from '../../../src/components/ui/StatTile';
import { usePerformance, useTopicPerformance } from '../../../src/hooks';

const RANGES = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'all', label: 'All time' },
];

/** Extended performance detail (student view of student_performance_detail). */
export default function PerformanceDetailScreen() {
  const { period } = useLocalSearchParams();
  const [range, setRange] = useState(period || 'all');
  const { data: summary, isLoading, isError, refetch } = usePerformance(range);
  const { data: topics } = useTopicPerformance();

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Performance detail">
      <Screen>
        <View className="flex-row items-center gap-3 px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <Button.IconFallback />
          </Button>
        </View>

        {isLoading ? (
          <View className="px-[24px] gap-3">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </View>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <ScrollView contentContainerClassName="px-[24px] pb-8" showsVerticalScrollIndicator={false}>
            <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface mb-4">Detailed performance</Text>

            <View className="flex-row gap-2 mb-6">
              {RANGES.map((r) => (
                <Pressable
                  key={r.key}
                  onPress={() => setRange(r.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Range ${r.label}`}
                  className={`px-3 py-2 rounded-full border ${range === r.key ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-lowest'}`}
                >
                  <Text className={`font-label-sm text-label-sm ${range === r.key ? 'text-primary' : 'text-on-surface-variant'}`}>{r.label}</Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-row gap-3 mb-6">
              <StatTile icon="star" label="Avg score" value={`${summary?.average_score ?? 0}%`} />
              <StatTile icon="school" label="Topics" value={summary?.topics_covered ?? 0} />
            </View>

            <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface mb-3">By topic</Text>
            {(topics || []).map((t) => (
              <Card key={t.topic_id} variant="flat" className="mb-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-body-md text-body-md text-on-surface">{t.topic_name}</Text>
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">best {t.best_score}%</Text>
                </View>
                <ProgressBar value={t.average_score} />
                <Text className="font-label-sm text-label-sm text-on-surface-variant mt-2">{t.attempts} attempts · avg {t.average_score}%</Text>
              </Card>
            ))}
          </ScrollView>
        )}
      </Screen>
    </SafeAreaView>
  );
}
