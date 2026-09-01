import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import Avatar from '../../../../src/components/ui/Avatar';
import Button from '../../../../src/components/ui/Button';
import MaterialIcon from '../../../../src/components/ui/MaterialIcon';
import Screen from '../../../../src/components/ui/Screen';
import { askAIStream } from '../../../../src/services/aiTutor';

function TypingDots() {
  const dots = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  useEffect(() => {
    dots.forEach((dot, i) => {
      dot.value = withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }), -1, true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View className="flex-row items-center gap-1 bg-surface-container-lowest rounded-2xl rounded-tl-sm px-4 py-3 border border-[#eff4ff] self-start" accessibilityLabel="AI is thinking">
      {dots.map((dot, i) => (
        <AnimatedDot key={i} sv={dot} delay={i} />
      ))}
    </View>
  );
}

function AnimatedDot({ sv, delay }) {
  const style = useAnimatedStyle(() => ({ opacity: 0.3 + 0.7 * sv.value, transform: [{ translateY: -4 * sv.value }] }));
  return <Animated.View style={style} className="w-1.5 h-1.5 bg-outline rounded-full" />;
}

function ChatMessage({ isUser, content }) {
  return (
    <View className={`flex-row gap-2 mb-4 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
      {!isUser && <Avatar name="AI" size="sm" />}
      <View
        className={`rounded-2xl p-4 ${isUser ? 'bg-primary rounded-tr-sm' : 'bg-surface-container-lowest border border-[#eff4ff] rounded-tl-sm'}`}
      >
        <Text className={`text-[16px] leading-6 ${isUser ? 'text-on-primary' : 'text-on-surface'}`}>{content}</Text>
      </View>
    </View>
  );
}

export default function AIChatScreen() {
  const { sessionId, initial } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (initial) {
      send(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, thinking]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || thinking) return;
    setInput('');
    setMessages((m) => [...m, { isUser: true, content: q }]);
    setThinking(true);
    try {
      // Seed the assistant message for streaming
      setMessages((m) => [...m, { isUser: false, content: '' }]);
      await askAIStream(
        { topic: 'Algebra', question: q },
        {
          onToken: (token) =>
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last && !last.isUser) last.content += token;
              return [...copy];
            }),
        }
      );
    } catch {
      setMessages((m) => [...m.slice(0, -1), { isUser: false, content: 'Sorry — I could not reach the tutor. Please try again.' }]);
    } finally {
      setThinking(false);
    }
  };

  const suggestions = ['Show example', 'Try similar', 'Explain differently'];

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="AI tutor chat">
      <Screen>
        <View className="flex-row items-center justify-between h-16 px-[24px] border-b border-[#e5eeff]/50">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Button>
          <View className="items-center flex-1">
            <Text className="text-[20px] leading-7 font-semibold text-primary">MathMaster AI</Text>
            <Text className="font-label-sm text-label-sm text-on-surface-variant">Algebra Basics</Text>
          </View>
          <Button variant="icon" onPress={() => router.push('/(student)/ai-tutor/history')} accessibilityLabel="Chat history">
            <MaterialIcon name="history" size={20} color="on-surface-variant" />
          </Button>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView ref={scrollRef} contentContainerClassName="px-4 py-4" showsVerticalScrollIndicator={false}>
            {messages.map((m, i) => (
              <ChatMessage key={i} isUser={m.isUser} content={m.content} />
            ))}
            {thinking && !messages[messages.length - 1]?.content ? <TypingDots /> : null}
          </ScrollView>

          {/* Suggestion chips + input bar */}
          <View className="pb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4 pb-3">
              {suggestions.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => send(s)}
                  accessibilityRole="button"
                  accessibilityLabel={`Suggestion: ${s}`}
                  className="whitespace-nowrap px-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest"
                >
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View className="px-4">
              <View className="bg-surface-container-lowest rounded-full flex-row items-center pl-2 pr-1 py-1 border border-[#dce9ff]">
                <Button variant="icon" onPress={() => {}} accessibilityLabel="Add attachment">
                  <MaterialIcon name="add_circle" size={24} color="outline" />
                </Button>
                <TextInput
                  className="flex-1 px-2 py-2 text-[16px] leading-6 text-on-surface"
                  placeholder="Message MathMaster…"
                  placeholderTextColor="#bec8d2"
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={() => send()}
                  returnKeyType="send"
                  accessibilityLabel="Message input"
                />
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
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </SafeAreaView>
  );
}
