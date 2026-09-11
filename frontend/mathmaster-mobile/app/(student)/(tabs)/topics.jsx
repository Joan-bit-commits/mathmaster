import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import EmptyState from '../../../src/components/ui/EmptyState';
import ErrorState from '../../../src/components/ui/ErrorState';
import LevelTabs from '../../../src/components/ui/LevelTabs';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import Screen from '../../../src/components/ui/Screen';
import SearchField from '../../../src/components/ui/SearchField';
import TopicListItem from '../../../src/components/ui/TopicListItem';
import { useTopics } from '../../../src/hooks';
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';

const LEVELS = ['All', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'UNIVERSITY'];

export default function AllTopicsScreen() {
  const [level, setLevel] = useState('All');
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, refetch, isRefetching } = useTopics(level === 'All' ? {} : { level });
  const tabBarSpacing = useTabBarSpacing();

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!query.trim()) return data;
    const q = query.trim().toLowerCase();
    return data.filter((t) => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
  }, [data, query]);

  const total = data?.length ?? 0;
  const completed = data?.filter((t) => (t.progress || 0) === 100).length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="All topics">
      <Screen>
        <View className="px-[24px] pt-4 pb-3">
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">
            All topics
          </Text>
          {total > 0 && (
            <Text className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {completed} of {total} completed
            </Text>
          )}
        </View>

        <View className="px-[24px] mb-3">
          <SearchField value={query} onChangeText={setQuery} placeholder="Search topics…" accessibilityLabel="Search topics" />
        </View>

        <LevelTabs options={LEVELS} value={level} onChange={setLevel} />

        {isLoading ? (
          <View className="px-[24px] gap-3">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </View>
        ) : isError ? (
          <ErrorState description="We couldn't load topics. Check your connection." onRetry={refetch} />
        ) : !filtered.length ? (
          <EmptyState
            icon="menu_book"
            title={query ? 'No matches found' : 'No topics here yet'}
            description={
              query
                ? 'Try a different search term, or clear it to browse all topics.'
                : 'Try another level filter, or check back soon — new topics are added regularly.'
            }
            actionLabel={query ? 'Clear search' : 'Show all levels'}
            onAction={() => (query ? setQuery('') : setLevel('All'))}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(t) => String(t.id)}
            contentContainerStyle={{ paddingBottom: tabBarSpacing + 24 }}
            contentContainerClassName="px-[24px] gap-3"
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006591" colors={['#006591']} />
            }
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(250)}>
                <TopicListItem topic={item} index={index} onPress={() => router.push(`/(student)/topic/${item.id}`)} />
              </Animated.View>
            )}
          />
        )}
      </Screen>
    </SafeAreaView>
  );
}