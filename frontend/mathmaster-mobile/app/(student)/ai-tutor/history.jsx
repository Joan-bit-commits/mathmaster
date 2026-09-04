import { router } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';

import Button from '../../../src/components/ui/Button';
import EmptyState from '../../../src/components/ui/EmptyState';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import Screen from '../../../src/components/ui/Screen';
import { friendlyDate } from '../../../src/lib/format';
import { getSessions } from '../../../src/services/aiTutor';

export default function AIChatHistoryScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['aiSessions'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return getSessions();
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="AI tutor history">
      <Screen>
        <View className="flex-row items-center gap-3 px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Button>
          <Text accessibilityRole="header" className="text-[22px] leading-8 font-semibold text-on-surface">
            Chat history
          </Text>
        </View>

        <View className="px-[24px] pb-4 pt-1">
          <Button
            label="Start new conversation"
            icon="add"
            onPress={() => router.push('/(student)/(tabs)/ai-tutor')}
            fullWidth
            accessibilityLabel="Start new conversation"
          />
        </View>

        {isLoading ? (
          <View className="px-[24px] gap-3">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </View>
        ) : !data?.length ? (
          <EmptyState
            icon="forum"
            title="No conversations yet"
            description="Ask your first question and the AI tutor will guide you step by step."
            actionLabel="Ask a question"
            onAction={() => router.push('/(student)/(tabs)/ai-tutor')}
          />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(s) => String(s.id)}
            contentContainerClassName="px-[24px] pb-8"
            ItemSeparatorComponent={() => <View className="h-2" />}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006591" colors={['#006591']} />
            }
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).duration(300)}>
                <Pressable
                  onPress={() => router.push(`/(student)/ai-tutor/chat/${item.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Session ${item.title}`}
                  className="bg-surface-container-lowest rounded-2xl p-4 shadow-level-1 active:opacity-90"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-11 h-11 rounded-full bg-[#c9e6ff] items-center justify-center">
                      <MaterialIcon name="smart_toy" size={20} color="primary" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[16px] leading-6 font-semibold text-on-surface" numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                        {friendlyDate(item.updated_at)} · {item.topic}
                      </Text>
                    </View>
                    <MaterialIcon name="chevron_right" size={20} color="on-surface-variant" />
                  </View>
                </Pressable>
              </Animated.View>
            )}
          />
        )}
      </Screen>
    </SafeAreaView>
  );
}