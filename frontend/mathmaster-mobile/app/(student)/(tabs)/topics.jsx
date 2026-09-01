import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';

import Card from '../../../src/components/ui/Card';
import Chip from '../../../src/components/ui/Chip';
import EmptyState from '../../../src/components/ui/EmptyState';
import ErrorState from '../../../src/components/ui/ErrorState';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import Screen from '../../../src/components/ui/Screen';
import { useTopics } from '../../../src/hooks';

const LEVELS = ['All', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'UNIVERSITY'];

function TopicCard({ topic, index }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)} className="w-[48.5%]">
      <Card onPress={() => router.push(`/(student)/topic/${topic.id}`)} className="h-full" accessibilityLabel={`Topic ${topic.name}`}>
        <View className="h-1 w-full bg-primary-container rounded-full mb-3" />
        <Text className="font-label-sm text-label-sm text-primary uppercase mb-2">{topic.level}</Text>
        <Text className="text-[18px] leading-6 font-semibold text-on-surface mb-2">{topic.name}</Text>
        <Text className="font-body-sm text-body-sm text-on-surface-variant mb-4" numberOfLines={2}>{topic.description}</Text>
        <ProgressBar value={topic.progress || 0} />
        <Text className="font-label-sm text-label-sm text-on-surface-variant mt-2">{topic.progress || 0}% complete</Text>
      </Card>
    </Animated.View>
  );
}

export default function AllTopicsScreen() {
  const [level, setLevel] = useState('All');
  const { data, isLoading, isError, refetch, isRefetching } = useTopics(level === 'All' ? {} : { level });

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="All topics">
      <Screen>
        <View className="px-[24px] pt-4 pb-2">
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">All topics</Text>
        </View>
        {/* Filter chips */}
        <View className="flex-row flex-wrap gap-2 px-[24px] pb-3">
          {LEVELS.map((l) => (
            <Chip key={l} label={l} selected={level === l} onPress={() => setLevel(l)} accessibilityLabel={`Filter level ${l}`} />
          ))}
        </View>

        {isLoading ? (
          <View className="px-[24px] flex-row flex-wrap gap-3">
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} variant="card" className="w-[48%]" />)}
          </View>
        ) : isError ? (
          <ErrorState description="We couldn't load topics. Check your connection." onRetry={refetch} />
        ) : !data?.length ? (
          <EmptyState
            icon="menu_book"
            title="No topics here yet"
            description="Try another level filter, or check back soon — new topics are added regularly."
            actionLabel="Show all levels"
            onAction={() => setLevel('All')}
          />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(t) => String(t.id)}
            numColumns={2}
            columnWrapperClassName="gap-3 px-[24px]"
            contentContainerClassName="gap-3 pb-8"
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006591" colors={['#006591']} />}
            renderItem={({ item, index }) => <TopicCard topic={item} index={index} />}
          />
        )}
      </Screen>
    </SafeAreaView>
  );
}
