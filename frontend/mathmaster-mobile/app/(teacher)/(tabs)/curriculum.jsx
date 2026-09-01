import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import Card from '../../../src/components/ui/Card';
import Chip from '../../../src/components/ui/Chip';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import Screen from '../../../src/components/ui/Screen';
import { useTopics } from '../../../src/hooks';

const FILTERS = ['All', 'S1', 'S2', 'S3', 'S4', 'Incomplete'];

export default function CurriculumManagementScreen() {
  const [filter, setFilter] = useState('All');
  const { data, isLoading, refetch, isRefetching } = useTopics(filter === 'All' ? {} : { level: filter });

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Curriculum management">
      <Screen>
        <View className="px-[24px] pt-4 pb-2">
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">Curriculum</Text>
        </View>
        <View className="flex-row flex-wrap gap-2 px-[24px] pb-3">
          {FILTERS.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} accessibilityLabel={`Filter ${f}`} />
          ))}
        </View>

        {isLoading ? (
          <View className="px-[24px] flex-row flex-wrap gap-3">
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} variant="card" className="w-[48%]" />)}
          </View>
        ) : (
          <FlatList
            data={data || []}
            keyExtractor={(t) => String(t.id)}
            numColumns={2}
            columnWrapperClassName="gap-3 px-[24px]"
            contentContainerClassName="gap-3 pb-28"
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006591" colors={['#006591']} />}
            renderItem={({ item }) => (
              <Card onPress={() => router.push(`/(teacher)/topic/${item.id}`)} className="w-[48%] relative" accessibilityLabel={`Edit topic ${item.name}`}>
                <Pressable
                  onPress={() => router.push(`/(teacher)/content/topic/new`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.name}`}
                  className="absolute top-2 right-2 w-9 h-9 rounded-full bg-surface-container-low items-center justify-center z-10"
                >
                  <MaterialIcon name="edit" size={16} color="primary" />
                </Pressable>
                <View className="h-1 w-full bg-primary-container rounded-full mb-3" />
                <Text className="font-label-sm text-label-sm text-primary uppercase mb-2">{item.level}</Text>
                <Text className="text-[18px] leading-6 font-semibold text-on-surface mb-2" numberOfLines={2}>{item.name}</Text>
                <ProgressBar value={item.progress || 0} />
                <Text className="font-label-sm text-label-sm text-on-surface-variant mt-2">{item.progress || 0}% complete</Text>
              </Card>
            )}
          />
        )}

        {/* FAB */}
        <Pressable
          onPress={() => router.push('/(teacher)/content/topic/new')}
          accessibilityRole="button"
          accessibilityLabel="New topic"
          className="absolute bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary items-center justify-center shadow-level-2"
        >
          <MaterialIcon name="add" size={28} color="on-primary" />
        </Pressable>
      </Screen>
    </SafeAreaView>
  );
}

// SafeAreaView import shim (tab screens render inside the navigator's safe area)
function SafeAreaView({ children, className }) {
  return <View className={className}>{children}</View>;
}
