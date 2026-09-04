import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import Button from '../../../src/components/ui/Button';
import Card from '../../../src/components/ui/Card';
import ErrorState from '../../../src/components/ui/ErrorState';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import Screen from '../../../src/components/ui/Screen';
import { useLessons, useTopic } from '../../../src/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data: topic, isLoading, isError, refetch } = useTopic(id);
  const { data: lessons, isLoading: lessonsLoading } = useLessons(id);

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Topic detail">
      <Screen>
        <View className="flex-row items-center gap-3 px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Button>
          <Text className="font-label-sm text-label-sm text-on-surface-variant">Topics / {topic?.level || ''}</Text>
        </View>

        {isLoading ? (
          <View className="px-[24px] gap-3">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </View>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <ScrollView contentContainerClassName="px-[24px] pb-28" showsVerticalScrollIndicator={false}>
            <Card variant="hero" className="mb-6">
              <Text className="font-label-sm text-label-sm text-[#89ceff] uppercase mb-2">{topic?.level} · {topic?.subject}</Text>
              <Text className="text-[28px] leading-9 font-semibold text-white mb-2">{topic?.name}</Text>
              <Text className="font-body-md text-body-md text-[#b6c2d2] mb-4">{topic?.description}</Text>
              <View className="flex-row gap-4">
                <Text className="font-label-sm text-label-sm text-[#89ceff]">📚 {lessons?.length ?? 0} lessons</Text>
                <Text className="font-label-sm text-label-sm text-[#ffb95f]">📝 {lessons?.length ?? 0} quizzes</Text>
              </View>
            </Card>

            <View className="mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="font-label-sm text-label-sm text-on-surface-variant">YOUR PROGRESS</Text>
                <Text className="font-label-sm text-label-sm text-primary">{topic?.progress ?? 0}%</Text>
              </View>
              <ProgressBar value={topic?.progress ?? 0} />
            </View>

            <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface mb-3">Lessons</Text>
            {lessonsLoading ? (
              [...Array(3)].map((_, i) => <LoadingSkeleton key={i} className="mb-3" />)
            ) : (
              lessons?.map((lesson, i) => (
                <Card key={lesson.id} onPress={() => router.push(`/(student)/lesson/${lesson.id}`)} className="mb-3" accessibilityLabel={`Lesson ${lesson.title}`}>
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                      <Text className="text-on-primary font-bold">{i + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[18px] leading-6 font-semibold text-on-surface">{lesson.title}</Text>
                      <Text className="font-label-sm text-label-sm text-on-surface-variant">{lesson.duration_minutes} min</Text>
                    </View>
                    <MaterialIcon name="chevron_right" size={22} color="on-surface-variant" />
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
        )}

        {/* Sticky bottom CTA */}
        {!isLoading && lessons?.length ? (
          <View className="absolute bottom-0 left-0 right-0 px-[24px] pb-4 pt-2 bg-gradient-to-t from-background">
            <Button
              label={`Continue with Lesson 1`}
              onPress={() => router.push(`/(student)/lesson/${lessons[0].id}`)}
              fullWidth
              accessibilityLabel="Continue learning"
            />
          </View>
        ) : null}
      </Screen>
    </SafeAreaView>
  );
}
