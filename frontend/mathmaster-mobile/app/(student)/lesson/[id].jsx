import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import Button from '../../../src/components/ui/Button';
import Card from '../../../src/components/ui/Card';
import ErrorState from '../../../src/components/ui/ErrorState';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import Screen from '../../../src/components/ui/Screen';
import { useLesson, useQuizzes } from '../../../src/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Renders simple markdown-ish lesson content (headings, bold, lists). */
function LessonContent({ content }) {
  const blocks = (content || '').split('\n').filter((l) => l.trim());
  return (
    <View className="gap-2">
      {blocks.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <Text key={i} accessibilityRole="header" className="text-[20px] leading-7 font-semibold text-primary mt-3">
              {line.replace('## ', '')}
            </Text>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <Text key={i} accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface mt-2">
              {line.replace('### ', '')}
            </Text>
          );
        }
        if (line.startsWith('```')) return null;
        if (/^\d+\./.test(line) || line.startsWith('- ')) {
          return (
            <View key={i} className="flex-row gap-2 ml-1">
              <View className="w-0.5 bg-primary rounded-full" />
              <Text className="flex-1 text-[16px] leading-6 text-on-surface">{line.replace(/^\d+\.\s*/, '').replace('- ', '')}</Text>
            </View>
          );
        }
        if (line.includes('x =') || line.includes('=') && /[√²±]/.test(line)) {
          return (
            <View key={i} className="bg-surface-variant rounded-xl py-4 px-3 border border-dashed border-primary/30 items-center my-2">
              <Text className="text-[24px] leading-8 font-bold text-primary text-center">{line.replace(/```/g, '')}</Text>
            </View>
          );
        }
        if (/^\*\*.+\*\*$/.test(line.trim())) {
          return (
            <Text key={i} className="text-[16px] leading-6 font-semibold text-on-surface">
              {line.replace(/\*\*/g, '')}
            </Text>
          );
        }
        return (
          <Text key={i} className="text-[16px] leading-6 text-on-surface">
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      })}
    </View>
  );
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const { data: lesson, isLoading, isError, refetch } = useLesson(id);
  const { data: quizzes } = useQuizzes(id);
  const [completed, setCompleted] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Lesson">
      <Screen>
        <View className="flex-row items-center gap-3 px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Button>
          <View className="flex-1">
            <Text className="font-label-sm text-label-sm text-on-surface-variant">LESSON</Text>
          </View>
        </View>

        {isLoading ? (
          <View className="px-[24px] gap-3">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </View>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <ScrollView contentContainerClassName="px-[24px] pb-32" showsVerticalScrollIndicator={false}>
            <Text accessibilityRole="header" className="text-[28px] leading-9 font-semibold text-on-surface mb-4">
              {lesson?.title}
            </Text>
            <Card variant="flat" className="mb-6">
              <LessonContent content={lesson?.content} />
            </Card>
            <Button
              label={completed ? '✓ Completed' : 'Mark as complete'}
              variant={completed ? 'secondary' : 'primary'}
              onPress={() => setCompleted(true)}
              fullWidth
              accessibilityLabel="Mark lesson as complete"
            />
          </ScrollView>
        )}

        {/* Sticky bottom nav with quiz CTA */}
        {!isLoading && (
          <View className="absolute bottom-0 left-0 right-0 px-[24px] pb-4 pt-3 bg-background/95 border-t border-surface-container/50 flex-row gap-3">
            <Button variant="secondary" label="Lesson list" onPress={() => router.back()} accessibilityLabel="Back to lesson list" />
            <Button
              label={quizzes?.length ? 'Take quiz' : 'No quiz yet'}
              onPress={() => quizzes?.length && router.push(`/(student)/lesson/${id}/quizzes`)}
              fullWidth
              accessibilityLabel="Take the quiz"
            />
          </View>
        )}
      </Screen>
    </SafeAreaView>
  );
}
