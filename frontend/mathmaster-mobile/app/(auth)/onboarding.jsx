import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Button from '../../src/components/ui/Button';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🧠',
    title: 'Learn math your way',
    body: 'Bite-sized lessons built for the Ugandan S1–S6 curriculum, from algebra to matrices.',
    color: '#006591',
  },
  {
    emoji: '🤖',
    title: 'An AI tutor, always on',
    body: 'Stuck on a problem? Ask MathMaster AI to explain it step by step, any time of day.',
    color: '#4648d4',
  },
  {
    emoji: '🏆',
    title: 'See yourself improve',
    body: 'Track streaks, mastery and quiz scores as you climb from S1 to university level.',
    color: '#855300',
  },
];

export default function OnboardingScreen() {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const onNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Onboarding">
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index: i }) => (
          <Animated.View
            entering={FadeInDown.delay(i * 100).duration(300)}
            style={{ width }}
            className="flex-1 items-center justify-center px-[24px]"
          >
            <View className="w-32 h-32 rounded-full bg-surface-container-low items-center justify-center mb-8">
              <Text className="text-6xl">{item.emoji}</Text>
            </View>
            <Text accessibilityRole="header" className="text-[28px] leading-9 font-semibold text-on-surface text-center mb-3">
              {item.title}
            </Text>
            <Text className="text-[16px] leading-6 text-[#3e4850] text-center">{item.body}</Text>
          </Animated.View>
        )}
      />
      <View className="px-[24px] pb-8">
        <View className="flex-row justify-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${i === index ? 'w-6 bg-primary' : 'w-2 bg-outline-variant'}`}
              accessibilityLabel={`Slide ${i + 1} of ${SLIDES.length}`}
            />
          ))}
        </View>
        <Button
          label={index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={onNext}
          fullWidth
          accessibilityLabel={index === SLIDES.length - 1 ? 'Get started' : 'Next slide'}
        />
        {index < SLIDES.length - 1 ? (
          <Pressable onPress={() => router.replace('/(auth)/login')} accessibilityRole="button" accessibilityLabel="Skip onboarding" className="mt-4 items-center">
            <Text className="font-label-sm text-label-sm text-on-surface-variant">Skip</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
