import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../../../src/components/ui/Button';
import Card from '../../../../src/components/ui/Card';
import EmptyState from '../../../../src/components/ui/EmptyState';
import LoadingSkeleton from '../../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../../src/components/ui/MaterialIcon';
import Screen from '../../../../src/components/ui/Screen';
import { useQuizzes } from '../../../../src/hooks';

export default function QuizListScreen() {
  const { id: lessonId } = useLocalSearchParams();
  const { data, isLoading, refetch, isRefetching } = useQuizzes(lessonId);

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Quiz list">
      <Screen>
        <View className="flex-row items-center gap-3 px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Button>
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">Quizzes</Text>
        </View>

        {isLoading ? (
          <View className="px-[24px] gap-3">
            {[...Array(3)].map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
          </View>
        ) : !data?.length ? (
          <EmptyState
            icon="quiz"
            title="No quizzes yet"
            description="Your teacher hasn't added quizzes for this lesson. Check back after the next class!"
            actionLabel="Back to lesson"
            onAction={() => router.back()}
          />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(q) => String(q.id)}
            contentContainerClassName="px-[24px] pb-8 gap-3"
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006591" colors={['#006591']} />}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
                <Card onPress={() => router.push(`/(student)/quiz/${item.id}`)} accessibilityLabel={`Start ${item.title}`}>
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-xl bg-[#e1e0ff] items-center justify-center">
                      <MaterialIcon name="quiz" size={24} color="#4648d4" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[18px] leading-6 font-semibold text-on-surface">{item.title}</Text>
                      <Text className="font-body-sm text-body-sm text-on-surface-variant">{item.question_count || 5} questions</Text>
                    </View>
                    <MaterialIcon name="chevron_right" size={22} color="on-surface-variant" />
                  </View>
                </Card>
              </Animated.View>
            )}
          />
        )}
      </Screen>
    </SafeAreaView>
  );
}
