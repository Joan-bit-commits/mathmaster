import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Button from '../../../src/components/ui/Button';
import Card from '../../../src/components/ui/Card';
import Chip from '../../../src/components/ui/Chip';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import Screen from '../../../src/components/ui/Screen';

const QUICK_PROMPTS = [
  { icon: 'functions', title: 'Solve an equation', body: 'e.g. 2x + 5 = 13' },
  { icon: 'psychology', title: 'Explain a concept', body: 'What is a Venn diagram?' },
  { icon: 'calculate', title: 'Check my working', body: 'Is my answer right?' },
  { icon: 'lightbulb', title: 'Give me a hint', body: 'Without the full answer' },
];

export default function AITutorNewChatScreen() {
  const [message, setMessage] = useState('');

  const send = (text) => {
    const q = (text ?? message).trim();
    if (!q) return;
    router.push({ pathname: '/(student)/ai-tutor/chat/1', params: { initial: q } });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="AI tutor">
      <Screen>
        <View className="flex-row items-center justify-between h-16 px-[24px]">
          <View className="flex-row items-center gap-2">
            <MaterialIcon name="smart_toy" size={24} color="primary" />
            <Text className="text-[24px] leading-8 font-semibold text-primary">AI Tutor</Text>
          </View>
          <Button variant="icon" onPress={() => router.push('/(student)/ai-tutor/history')} accessibilityLabel="Chat history">
            <MaterialIcon name="history" size={22} color="on-surface-variant" />
          </Button>
        </View>

        <ScrollView contentContainerClassName="px-[24px] pb-32" showsVerticalScrollIndicator={false}>
          <Card variant="hero" className="mb-6">
            <View className="flex-row items-center gap-3 mb-2">
              <MaterialIcon name="auto_awesome" size={28} color="primary" />
              <Text className="text-[24px] leading-8 font-semibold text-white">Ask any math question</Text>
            </View>
            <Text className="font-body-md text-body-md text-[#b6c2d2]">
              Get step-by-step explanations tailored to your level.
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-4">
              {['Algebra', 'Geometry', 'Trigonometry', 'Statistics'].map((t) => (
                <View key={t} className="bg-white/10 rounded-full px-3 py-1 border border-white/10">
                  <Text className="font-label-sm text-label-sm text-[#89ceff]">{t}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-3">Try one of these</Text>
          {QUICK_PROMPTS.map((p, i) => (
            <Animated.View key={p.title} entering={FadeInDown.delay(i * 60).duration(300)}>
              <Card onPress={() => send(p.body)} className="mb-3" accessibilityLabel={p.title}>
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-[#c9e6ff] items-center justify-center">
                    <MaterialIcon name={p.icon} size={20} color="primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[18px] leading-6 font-semibold text-on-surface">{p.title}</Text>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">{p.body}</Text>
                  </View>
                  <MaterialIcon name="chevron_right" size={20} color="on-surface-variant" />
                </View>
              </Card>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Sticky input bar */}
        <View className="absolute bottom-4 left-0 right-0 px-4">
          <View className="bg-surface-container-lowest rounded-full flex-row items-center pl-2 pr-1 py-1 border border-[#dce9ff]">
            <Button variant="icon" onPress={() => {}} accessibilityLabel="Add attachment">
              <MaterialIcon name="add_circle" size={24} color="outline" />
            </Button>
            <Pressable className="flex-1" onPress={() => {}} accessibilityLabel="Message input">
              <Text className="text-[16px] leading-6 text-[#bec8d2]">Message MathMaster…</Text>
            </Pressable>
            <Pressable
              onPress={() => send()}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              className="bg-primary w-10 h-10 rounded-full items-center justify-center ml-1"
            >
              <MaterialIcon name="send" size={18} color="on-primary" />
            </Pressable>
          </View>
        </View>
      </Screen>
    </SafeAreaView>
  );
}
