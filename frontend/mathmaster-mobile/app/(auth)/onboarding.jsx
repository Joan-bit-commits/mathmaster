import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import AnimatedBackground from '../../src/components/ui/AnimatedBackground';
import Button from '../../src/components/ui/Button';
import StepDots from '../../src/components/ui/StepDots';

const { width } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const SLIDES = [
  {
    lottie: require('../../assets/lottie/brain-learning.json'),
    title: 'Learn math your way',
    body: 'Bite-sized lessons built for the Ugandan S1–S6 curriculum, from algebra to matrices.',
    colors: ['#006591', '#0284c7'],
  },
  {
    lottie: require('../../assets/lottie/ai-robot.json'),
    title: 'An AI tutor, always on',
    body: 'Stuck on a problem? Ask MathMaster AI to explain it step by step, any time of day.',
    colors: ['#4648d4', '#7c6ff0'],
  },
  {
    lottie: require('../../assets/lottie/trophy-growth.json'),
    title: 'See yourself improve',
    body: 'Track streaks, mastery and quiz scores as you climb from S1 to university level.',
    colors: ['#855300', '#d88a00'],
  },
];

function Slide({ item, index, scrollX, isActive }) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const lottieRef = useRef(null);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolate.CLAMP) }],
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP),
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP),
    transform: [{ translateY: interpolate(scrollX.value, inputRange, [16, 0, 16], Extrapolate.CLAMP) }],
  }));

  React.useEffect(() => {
    if (isActive) lottieRef.current?.play();
    else lottieRef.current?.reset();
  }, [isActive]);

  return (
    <View style={{ width }} className="flex-1 items-center justify-center px-[24px]">
      <Animated.View style={[iconStyle, { width: 220, height: 220 }]}>
        <LottieView
          ref={lottieRef}
          source={item.lottie}
          autoPlay={index === 0}
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
      <Animated.View style={textStyle} className="items-center mt-4">
        <Text accessibilityRole="header" className="text-[28px] leading-9 font-semibold text-on-surface text-center mb-3">
          {item.title}
        </Text>
        <Text className="text-[16px] leading-6 text-[#3e4850] text-center">{item.body}</Text>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollX.value = e.contentOffset.x; },
  });

  const onMomentumEnd = (e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  const onNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Onboarding">
      <AnimatedBackground colors={SLIDES[index].colors} />
      <AnimatedFlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item, index: i }) => (
          <Slide item={item} index={i} scrollX={scrollX} isActive={i === index} />
        )}
      />
      <View className="px-[24px] pb-8">
        <StepDots count={SLIDES.length} activeIndex={index} className="mb-8" />
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