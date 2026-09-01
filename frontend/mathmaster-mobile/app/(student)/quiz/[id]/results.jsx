import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../../../src/components/ui/Button';
import Card from '../../../../src/components/ui/Card';
import LoadingSkeleton from '../../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../../src/components/ui/MaterialIcon';
import Screen from '../../../../src/components/ui/Screen';
import { useQuestions, useQuiz, useSubmitAttempt } from '../../../../src/hooks';

function tier(score) {
  if (score >= 90) return { label: 'Excellent', tone: 'success', emoji: '🏆' };
  if (score >= 70) return { label: 'Good job', tone: 'info', emoji: '🎉' };
  if (score >= 50) return { label: 'Keep going', tone: 'warning', emoji: '💪' };
  return { label: 'Keep practising', tone: 'error', emoji: '📚' };
}

function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return display;
}

export default function QuizResultsScreen() {
  const { id, answers: answersParam } = useLocalSearchParams();
  const { data: quiz } = useQuiz(id);
  const { data: questions } = useQuestions(id);
  const submitAttempt = useSubmitAttempt(id);
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const answers = answersParam ? JSON.parse(answersParam) : [];
    submitAttempt.mutateAsync(answers).then(setResult).catch(() => setResult({ score: 0, offline: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = result?.score ?? 0;
  const displayScore = useCountUp(score);
  const scale = useSharedValue(0.5);
  useEffect(() => {
    if (result) scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.6)) });
  }, [result, scale]);
  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (!result) {
    return (
      <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Quiz results loading">
        <View className="px-[24px] pt-16 gap-3">
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  const t = tier(score);

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Quiz results">
      <Screen>
        <ScrollView contentContainerClassName="px-[24px] pb-10" showsVerticalScrollIndicator={false}>
          {/* Score hero */}
          <View className="items-center py-8" accessibilityLiveRegion="polite">
            <Animated.View style={scoreStyle} className="w-40 h-40 rounded-full bg-surface-container-lowest border-4 border-primary items-center justify-center shadow-level-2">
              <Text className="text-[56px] leading-16 font-bold text-primary">{displayScore}%</Text>
              <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase">Your score</Text>
            </Animated.View>
            <Text className="text-[28px] leading-9 font-semibold text-on-surface mt-6">{t.emoji} {t.label}</Text>
            <Text className="font-body-md text-body-md text-on-surface-variant mt-1">
              ✨ You earned {result.xp_earned ?? Math.round(score / 2)} XP
            </Text>
            {result.offline ? (
              <Text className="font-body-sm text-body-sm text-[#b26a00] mt-2">Saved locally — will sync when you're back online.</Text>
            ) : null}
          </View>

          {/* Review answers */}
          <Pressable
            onPress={() => setShowReview(!showReview)}
            accessibilityRole="button"
            accessibilityLabel="Toggle answer review"
            className="flex-row items-center justify-between bg-surface-container-lowest rounded-2xl p-4 border border-surface-variant/50 mb-3"
          >
            <Text className="text-[18px] leading-6 font-semibold text-on-surface">Review answers</Text>
            <MaterialIcon name={showReview ? 'expand_less' : 'expand_more'} size={22} color="on-surface-variant" />
          </Pressable>
          {showReview &&
            (questions || []).map((q, i) => (
              <Card key={q.id} variant="flat" className="mb-2">
                <Text className="font-body-sm text-body-sm text-on-surface font-semibold mb-1">
                  {i + 1}. {q.question_text}
                </Text>
                <Text className="font-label-sm text-label-sm text-success">✓ Correct answer: {q.correct_answer}</Text>
              </Card>
            ))}

          {/* Actions */}
          <View className="gap-3 mt-6">
            <Button label="Try again" onPress={() => router.replace(`/(student)/quiz/${id}`)} fullWidth accessibilityLabel="Try the quiz again" />
            <Button variant="secondary" label="Back to lesson" onPress={() => router.back()} fullWidth accessibilityLabel="Back to lesson" />
            <Button variant="tertiary" label="Share result" icon="share" onPress={() => {}} fullWidth accessibilityLabel="Share result" />
          </View>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
