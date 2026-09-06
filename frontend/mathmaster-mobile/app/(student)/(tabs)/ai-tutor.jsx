import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Button from "../../../src/components/ui/Button";
import KeyboardScreen from "../../../src/components/ui/KeyboardScreen";
import MaterialIcon from "../../../src/components/ui/MaterialIcon";
import Screen from "../../../src/components/ui/Screen";
import ModeTabs from "../../../src/components/ui/ModeTabs";
import CaptureFAB from "../../../src/components/ui/CaptureFAB";

const QUICK_PROMPTS = [
  { icon: "functions", title: "Solve an equation", body: "e.g. 2x + 5 = 13" },
  {
    icon: "psychology",
    title: "Explain a concept",
    body: "What is a Venn diagram?",
  },
  { icon: "calculate", title: "Check my working", body: "Is my answer right?" },
  {
    icon: "lightbulb",
    title: "Give me a hint",
    body: "Without the full answer",
  },
];

const MIN_INPUT_HEIGHT = 24;
const MAX_INPUT_HEIGHT = 100;

export default function AITutorNewChatScreen() {
  const [message, setMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);

  const lift = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.06);
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  const handleFocus = () => {
    lift.value = withTiming(-2, { duration: 150 });
    shadowOpacity.value = withTiming(0.16, { duration: 150 });
  };
  const handleBlur = () => {
    lift.value = withTiming(0, { duration: 150 });
    shadowOpacity.value = withTiming(0.06, { duration: 150 });
  };

  const send = (text) => {
    const q = (text ?? message).trim();
    if (!q) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setMessage("");
    setInputHeight(MIN_INPUT_HEIGHT);
    router.push({
      pathname: "/(student)/ai-tutor/chat/1",
      params: { initial: q },
    });
  };

  const canSend = message.trim().length > 0;

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      accessibilityLabel="AI tutor"
    >
      <Screen>
        <ModeTabs className="mx-6 mt-2" value="Chat" onChange={(mode) => mode === 'Scan' ? router.push('/(student)/scan') : mode === 'Doc' ? router.push('/(student)/documents') : null} />
        <View className="flex-row items-center justify-between h-16 px-[24px]">
          <View className="flex-row items-center gap-2">
            <MaterialIcon name="smart_toy" size={24} color="primary" />
            <Text className="text-[24px] leading-8 font-semibold text-primary">
              AI Tutor
            </Text>
          </View>
          <Button
            variant="icon"
            onPress={() => router.push("/(student)/ai-tutor/history")}
            accessibilityLabel="Chat history"
          >
            <MaterialIcon name="history" size={22} color="on-surface-variant" />
          </Button>
        </View>

        <KeyboardScreen className="flex-1">
          <View className="flex-1 justify-center px-[24px]">
            {/* Greeting — minimal, centered */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-full bg-[#c9e6ff] items-center justify-center mb-4">
                <MaterialIcon name="auto_awesome" size={30} color="primary" />
              </View>
              <Text className="text-[22px] leading-7 font-semibold text-on-surface text-center">
                Ask any math question
              </Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant text-center mt-1">
                Get step-by-step explanations tailored to your level
              </Text>
            </View>

            {/* Input box */}
            <Animated.View
              style={[
                barStyle,
                {
                  shadowColor: "#006591",
                  shadowOffset: { width: 0, height: 4 },
                  shadowRadius: 16,
                  elevation: 4,
                },
              ]}
              className="bg-surface-container-lowest rounded-3xl flex-row items-end pl-2 pr-1.5 py-1.5"
            >
              <Button
                variant="icon"
                onPress={() => {}}
                accessibilityLabel="Add attachment"
              >
                <MaterialIcon name="add_circle" size={24} color="outline" />
              </Button>
              <TextInput
                value={message}
                onChangeText={setMessage}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Message MathMaster…"
                placeholderTextColor="#8b96a3"
                multiline
                onContentSizeChange={(e) =>
                  setInputHeight(
                    Math.min(
                      Math.max(
                        e.nativeEvent.contentSize.height,
                        MIN_INPUT_HEIGHT,
                      ),
                      MAX_INPUT_HEIGHT,
                    ),
                  )
                }
                style={{ height: inputHeight }}
                className="flex-1 text-[16px] leading-6 text-on-surface px-2 py-2"
                accessibilityLabel="Message input"
                onSubmitEditing={() => send()}
                blurOnSubmit={false}
              />
              <Pressable
                onPress={() => send()}
                disabled={!canSend}
                accessibilityRole="button"
                accessibilityLabel="Send message"
                accessibilityState={{ disabled: !canSend }}
                className={`w-10 h-10 rounded-full items-center justify-center ml-1 mb-0.5 ${
                  canSend ? "bg-primary" : "bg-surface-variant"
                }`}
              >
                <MaterialIcon
                  name="send"
                  size={18}
                  color={canSend ? "on-primary" : "on-surface-variant"}
                />
              </Pressable>
            </Animated.View>

            {/* Quick prompts — below the input, compact */}
            <View className="mt-5">
              <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2 ml-1">
                Try asking
              </Text>
              <View className="gap-2">
                {QUICK_PROMPTS.map((p, i) => (
                  <Animated.View
                    key={p.title}
                    entering={FadeInDown.delay(i * 50).duration(250)}
                  >
                    <Pressable
                      onPress={() => send(p.body)}
                      accessibilityRole="button"
                      accessibilityLabel={p.title}
                      className="flex-row items-center gap-3 bg-surface-container-lowest rounded-2xl px-3 py-2.5 shadow-level-1 active:opacity-80"
                    >
                      <View className="w-8 h-8 rounded-full bg-[#c9e6ff] items-center justify-center">
                        <MaterialIcon name={p.icon} size={16} color="primary" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[14px] leading-5 font-semibold text-on-surface">
                          {p.title}
                        </Text>
                        <Text className="font-body-sm text-[12px] leading-4 text-on-surface-variant">
                          {p.body}
                        </Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </View>
          </View>
        </KeyboardScreen>
      </Screen>
      <CaptureFAB className="absolute bottom-8 right-6" onPress={() => router.push('/(student)/scan/camera')} />
    </SafeAreaView>
  );
}
