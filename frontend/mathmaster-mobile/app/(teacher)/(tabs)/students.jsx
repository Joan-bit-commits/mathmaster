import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LevelTabs from '../../../src/components/ui/LevelTabs';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import Screen from '../../../src/components/ui/Screen';
import StatCard from '../../../src/components/ui/StatCard';
import StudentRow from '../../../src/components/ui/StudentRow';
import { useTeacherStudents } from '../../../src/hooks';
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';

const FILTERS = ['All', 'At risk', 'On track'];

export default function StudentsRosterScreen() {
  const { data, isLoading, refetch, isRefetching } = useTeacherStudents();
  const tabBarSpacing = useTabBarSpacing();
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === 'At risk') return data.filter((s) => s.average_score < 50);
    if (filter === 'On track') return data.filter((s) => s.average_score >= 70);
    return data;
  }, [data, filter]);

  const total = data?.length ?? 0;
  const avgScore = total ? Math.round(data.reduce((a, s) => a + s.average_score, 0) / total) : 0;
  const atRisk = total ? data.filter((s) => s.average_score < 50).length : 0;

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Students roster">
      <Screen>
        <View className="px-[24px] pt-4 pb-2">
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">
            Students
          </Text>
          <Text className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Track how your class is doing
          </Text>
        </View>

        {/* Summary */}
        <View className="flex-row gap-3 px-[24px] mb-4 mt-2">
          <StatCard icon="groups" label="Total" value={total || '—'} tone="primary" />
          <StatCard icon="trending_up" label="Avg score" value={total ? `${avgScore}%` : '—'} tone="secondary" />
          <StatCard icon="warning" label="At risk" value={total ? atRisk : '—'} tone="error" />
        </View>

        <LevelTabs options={FILTERS} value={filter} onChange={setFilter} />

        {isLoading ? (
          <View className="px-[24px] gap-3">
            {[...Array(5)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </View>
        ) : !filtered.length ? (
          <View className="items-center justify-center px-[24px] py-16">
            <Text className="text-[16px] leading-6 font-semibold text-on-surface mb-1">No students here</Text>
            <Text className="font-body-sm text-body-sm text-on-surface-variant text-center">
              No one matches this filter right now.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(s) => String(s.id)}
            contentContainerStyle={{ paddingBottom: tabBarSpacing + 24, gap: 10 }}
            contentContainerClassName="px-[24px]"
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006591" colors={['#006591']} />
            }
            renderItem={({ item }) => (
              <StudentRow student={item} onPress={() => router.push(`/(teacher)/student/${item.id}`)} />
            )}
          />
        )}
      </Screen>
    </SafeAreaView>
  );
}
