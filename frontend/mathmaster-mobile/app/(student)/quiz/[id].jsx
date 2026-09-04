import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../../src/components/ui/Button';
import Card from '../../../src/components/ui/Card';
import Chip from '../../../src/components/ui/Chip';
import ErrorState from '../../../src/components/ui/ErrorState';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import Screen from '../../../src/components/ui/Screen';
import { useQuestions, useQuiz } from '../../../src/hooks';

const LETTERS = ['A', 'B', 'C', 'D'];

function QuizChoiceButton({ choice, letter, selected, onSelect }) {
  return (
    <Pressable
      onPress={() => onSelect(choice)}
      accessibilityRole="button"
      accessibilityLabel={`Choice ${letter}: ${choice}`}
      accessibilityState={{ selected }}
      className={`flex-row items-center gap-4 p-4 rounded-xl border-2 mb-3 ${
        selected ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-lowest'
      }`}
    >
      <View
        className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
          selected ? 'border-primary bg-primary' : 'border-outline-variant'
        }`}
      >
        {selected ? (
          <MaterialIcon name="check" size={16} color="white" />
        ) : (
          <Text className="text-[18px] leading-6 font-semibold text-on-surface-variant">{letter}</Text>
        )}
      </View>
      <Text className="flex-1 text-[16px] leading-6 text-on-surface">{choice}</Text>
    </Pressable>
  );
}

export default function QuizQuestionScreen() {
  const { id } = useLocalSearchParams();
  const { data: quiz } = useQuiz(id);
  const { data: questions, isLoading, isError, refetch } = useQuestions(id);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // {questionId: choice}
  const [submitting, setSubmitting] = useState(false);

  const question = questions?.[index];
  const total = questions?.length || 0;
  const progress = total ? ((index + 1) / total) * 100 : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    import('expo-haptics').then((H) => H.notificationAsync(H.NotificationFeedbackType.Success)).catch(() => {});
    const payload = Object.entries(answers).map(([qid, answer]) => ({ question: Number(qid), answer }));
    // Pass answers via params to results screen (keeps this screen stateless)
    router.replace({
      pathname: `/(student)/quiz/${id}/results`,
      params: { answers: JSON.stringify(payload) },
    });
  };

  const selectChoice = (choice) => {
    setAnswers((prev) => ({ ...prev, [question.id]: choice }));
    import('expo-haptics').then((H) => H.selectionAsync()).catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Quiz question">
      <Screen>
        <View className="flex-row items-center gap-3 px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Quit quiz">
            <MaterialIcon name="close" size={22} color="on-surface-variant" />
          </Button>
          <View className="flex-1">
            <ProgressBar value={progress} />
          </View>
          <Chip tone="neutral" label={`⏱ 10:00`} accessibilityLabel="Time remaining 10 minutes" />
        </View>
        <Text className="px-[24px] pb-2 font-label-sm text-label-sm text-on-surface-variant uppercase">
          Question {index + 1} of {total || '…'}
        </Text>

        {isLoading ? (
          <View className="px-[24px] gap-3">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </View>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : question ? (
          <ScrollView contentContainerClassName="px-[24px] pb-28" showsVerticalScrollIndicator={false}>
            <Card className="mb-6">
              <View className="bg-surface-variant rounded-xl py-4 px-3 border border-dashed border-primary/30 items-center mb-4">
                <Text className="text-[20px] leading-7 font-semibold text-primary text-center">{question.question_text}</Text>
              </View>
              {question.choices?.length ? (
                question.choices.map((choice, ci) => (
                  <QuizChoiceButton
                    key={ci}
                    choice={String(choice)}
                    letter={LETTERS[ci] || String(ci + 1)}
                    selected={answers[question.id] === String(choice)}
                    onSelect={String(choice)}
                  />
                ))
              ) : (
                <Card variant="flat" className="mb-3">
                  <Text className="font-body-sm text-body-sm text-on-surface-variant">Short-answer question — type your answer in the box below.</Text>
                </Card>
              )}
            </Card>
          </ScrollView>
        ) : null}

        {/* Bottom nav */}
        {!isLoading && question ? (
          <View className="absolute bottom-0 left-0 right-0 px-[24px] pb-4 pt-3 bg-background/95 border-t border-surface-container/50 flex-row gap-3">
            <Button
              variant="secondary"
              label="Previous"
              disabled={index === 0}
              onPress={() => setIndex((i) => Math.max(0, i - 1))}
              accessibilityLabel="Previous question"
            />
            {index < total - 1 ? (
              <Button label="Next" onPress={() => setIndex((i) => i + 1)} fullWidth accessibilityLabel="Next question" />
            ) : (
              <Button label={submitting ? 'Submitting…' : 'Submit quiz'} onPress={handleSubmit} loading={submitting} fullWidth accessibilityLabel="Submit quiz" />
            )}
          </View>
        ) : null}
      </Screen>
    </SafeAreaView>
  );
}
