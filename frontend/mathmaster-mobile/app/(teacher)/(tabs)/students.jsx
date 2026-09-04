import { router } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Avatar from '../../../src/components/ui/Avatar';
import Card from '../../../src/components/ui/Card';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import Screen from '../../../src/components/ui/Screen';
import { friendlyDate } from '../../../src/lib/format';
import { useTeacherStudents } from '../../../src/hooks';

function Sparkline({ values, width = 60, height = 20 }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * width},${height - (v / max) * height}`)
    .join(' ');
  const Svg = require('react-native-svg').default || require('react-native-svg').Svg;
  const Polyline = require('react-native-svg').Polyline;
  return (
    <Svg width={width} height={height} accessibilityLabel="7-day trend">
      <Polyline points={points} fill="none" stroke="#006591" strokeWidth="2" />
    </Svg>
  );
}

export default function StudentsRosterScreen() {
  const { data, isLoading, refetch, isRefetching } = useTeacherStudents();

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Students roster">
      <Screen>
        <View className="px-[24px] pt-4 pb-2">
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">Students</Text>
        </View>

        {/* Summary tiles */}
        <View className="flex-row gap-3 px-[24px] mb-4">
          {[
            { label: 'Total', value: data?.length ?? '—' },
            { label: 'Avg score', value: data?.length ? `${Math.round(data.reduce((a, s) => a + s.average_score, 0) / data.length)}%` : '—' },
            { label: 'At risk', value: data?.length ? data.filter((s) => s.average_score < 50).length : '—' },
          ].map((tile) => (
            <View key={tile.label} className="flex-1 bg-surface-container-lowest rounded-2xl p-3 border border-surface-variant/50">
              <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase">{tile.label}</Text>
              <Text className="text-[24px] leading-8 font-bold text-on-surface">{tile.value}</Text>
            </View>
          ))}
        </View>

        {isLoading ? (
          <View className="px-[24px] gap-3">
            {[...Array(5)].map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
          </View>
        ) : (
          <FlatList
            data={data || []}
            keyExtractor={(s) => String(s.id)}
            contentContainerClassName="px-[24px] pb-8 gap-3"
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006591" colors={['#006591']} />}
            renderItem={({ item }) => (
              <Card onPress={() => router.push(`/(teacher)/student/${item.id}`)} accessibilityLabel={`Student ${item.name}`}>
                <View className="flex-row items-center gap-3">
                  <Avatar name={item.name} size="md" />
                  <View className="flex-1">
                    <Text className="text-[18px] leading-6 font-semibold text-on-surface">{item.name}</Text>
                    <Text className="font-label-sm text-label-sm text-on-surface-variant">
                      {item.level} · last active {friendlyDate(item.last_active)}
                    </Text>
                  </View>
                  <Sparkline values={item.trend} />
                  <Text className={`font-title-lg text-title-lg ${item.average_score >= 70 ? 'text-success' : item.average_score >= 50 ? 'text-[#b26a00]' : 'text-error'}`}>
                    {item.average_score}%
                  </Text>
                </View>
              </Card>
            )}
          />
        )}
      </Screen>
    </SafeAreaView>
  );
}
