import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedBackground from '../../src/components/ui/AnimatedBackground';
import Button from '../../src/components/ui/Button';
import MaterialIcon from '../../src/components/ui/MaterialIcon';
import { useAuthStore } from '../../src/stores/authStore';

const QUICK_START = [
  { icon: 'menu_book', title: 'Pick a topic', body: 'Start with your class level.' },
  { icon: 'quiz', title: 'Take a quiz', body: 'Check what you already know.' },
  { icon: 'smart_toy', title: 'Ask the AI tutor', body: 'Stuck? Get step-by-step help.' },
];

export default function RegisterSuccessScreen() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    import('expo-haptics').then((H) => H.notificationAsync(H.NotificationFeedbackType.Success)).catch(() => {});
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-[24px]" accessibilityLabel="Registration success">
      <AnimatedBackground colors={['#0f9d58', '#006591']} />
      <Animated.View entering={ZoomIn.duration(500)} className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-6">
        <MaterialIcon name="check" size={48} color="on-primary" />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(300)} className="items-center w-full">
        <Text accessibilityRole="header" className="text-[28px] leading-9 font-semibold text-on-surface text-center mb-2">
          Welcome aboard{user?.first_name ? `, ${user.first_name}` : ''}! 🎉
        </Text>
        <Text className="font-body-md text-body-md text-on-surface-variant text-center mb-8">
          Your account is ready. Here's how to get started:
        </Text>
        {QUICK_START.map((s, i) => (
          <Animated.View
            key={s.title}
            entering={FadeInDown.delay(300 + i * 100).duration(350)}
            className="flex-row items-center gap-3 bg-surface-container-lowest rounded-2xl p-4 shadow-level-1 w-full mb-3"
          >
            <View className="w-10 h-10 rounded-full bg-[#c9e6ff] items-center justify-center">
              <MaterialIcon name={s.icon} size={20} color="primary" />
            </View>
            <View className="flex-1">
              <Text className="font-title-lg text-title-lg text-on-surface">{`${i + 1}. ${s.title}`}</Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant">{s.body}</Text>
            </View>
          </Animated.View>
        ))}
        <View className="w-full mt-6">
          <Button label="Go to dashboard" onPress={() => router.replace(user?.role === 'teacher' ? '/(teacher)' : '/(student)')} fullWidth accessibilityLabel="Go to dashboard" />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}