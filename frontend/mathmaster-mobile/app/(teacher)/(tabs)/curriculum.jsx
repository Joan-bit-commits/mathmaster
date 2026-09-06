import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { LayoutAnimation, Pressable, RefreshControl, SectionList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LevelTabs from '../../../src/components/ui/LevelTabs';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import Screen from '../../../src/components/ui/Screen';
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';
import { useTopics } from '../../../src/hooks';

// New Architecture (Fabric) enables LayoutAnimation automatically — no setup call needed.

const FILTERS = ['All', 'S1', 'S2', 'S3', 'S4', 'Incomplete'];

function average(nums) {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export default function CurriculumManagementScreen() {
  const [filter, setFilter] = useState('All');
  const [collapsed, setCollapsed] = useState({});
  const { data, isLoading, refetch, isRefetching } = useTopics(filter === 'All' ? {} : { level: filter });
  const tabBarSpacing = useTabBarSpacing();

  const sections = useMemo(() => {
    const groups = {};
    (data || []).forEach((t) => {
      const key = t.level || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return Object.keys(groups)
      .sort()
      .map((level) => ({
        title: level,
        data: collapsed[level] ? [] : groups[level],
        count: groups[level].length,
        avgProgress: average(groups[level].map((t) => t.progress || 0)),
      }));
  }, [data, collapsed]);

  const toggleSection = (level) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((c) => ({ ...c, [level]: !c[level] }));
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Curriculum management">
      <Screen>
        <View className="px-[24px] pt-4 pb-2">
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">
            Curriculum
          </Text>
          <Text className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Browse and edit topics by level
          </Text>
        </View>

        <LevelTabs options={FILTERS} value={filter} onChange={setFilter} />

        {isLoading ? (
          <View className="px-[24px] gap-3">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(t) => String(t.id)}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: tabBarSpacing + 80 }}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006591" colors={['#006591']} />
            }
            renderSectionHeader={({ section }) => (
              <Pressable
                onPress={() => toggleSection(section.title)}
                accessibilityRole="button"
                accessibilityLabel={`Toggle ${section.title} section`}
                className="flex-row items-center justify-between bg-surface-container-lowest rounded-2xl px-4 py-3 mt-4 mb-2 shadow-level-1"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-9 h-9 rounded-full bg-primary-container items-center justify-center">
                    <Text className="font-label-sm text-label-sm text-primary font-bold">{section.title}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] leading-5 font-semibold text-on-surface">{section.title} topics</Text>
                    <Text className="font-label-sm text-label-sm text-on-surface-variant">
                      {section.count} topics · {section.avgProgress}% avg
                    </Text>
                  </View>
                </View>
                <MaterialIcon
                  name={collapsed[section.title] ? 'expand_more' : 'expand_less'}
                  size={22}
                  color="on-surface-variant"
                />
              </Pressable>
            )}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => router.push(`/(teacher)/topic/${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Edit topic ${item.name}`}
                className="flex-row items-center gap-3 bg-surface-container-lowest rounded-2xl px-4 py-3 mb-2 shadow-level-1 active:opacity-90"
              >
                <Text className="font-label-sm text-label-sm text-on-surface-variant w-5">{index + 1}</Text>
                <View className="flex-1">
                  <Text className="text-[16px] leading-6 font-semibold text-on-surface" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1.5">
                    <View className="flex-1">
                      <ProgressBar value={item.progress || 0} />
                    </View>
                    <Text className="font-label-sm text-label-sm text-on-surface-variant">{item.progress || 0}%</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => router.push('/(teacher)/content/topic/new')}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.name}`}
                  hitSlop={8}
                  className="w-9 h-9 rounded-full bg-surface-container-low items-center justify-center"
                >
                  <MaterialIcon name="edit" size={16} color="primary" />
                </Pressable>
              </Pressable>
            )}
          />
        )}

        {/* FAB */}
        <Pressable
          onPress={() => router.push('/(teacher)/content/topic/new')}
          accessibilityRole="button"
          accessibilityLabel="New topic"
          className="absolute right-6 w-14 h-14 rounded-2xl bg-primary items-center justify-center shadow-level-2"
          style={{ bottom: tabBarSpacing + 24 }}
        >
          <MaterialIcon name="add" size={28} color="on-primary" />
        </Pressable>
      </Screen>
    </SafeAreaView>
  );
}