import { useLocalSearchParams, router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ChatComposer from "../../../../src/components/chat/ChatComposer";
import MessageBubble from "../../../../src/components/chat/MessageBubble";
import TopicPicker from "../../../../src/components/chat/TopicPicker";
import KeyboardScreen from "../../../../src/components/ui/KeyboardScreen";
import MaterialIcon from "../../../../src/components/ui/MaterialIcon";
import Screen from "../../../../src/components/ui/Screen";
import { askAIStream, fetchSession } from "../../../../src/services/aiTutor";

const FOLLOW_UPS = ["Show an example", "Try a similar one", "Explain it differently"];
const STARTERS = ["Explain quadratic equations", "Help me solve 2x + 5 = 13", "What is Pythagoras' theorem?"];

let messageCounter = 0;
const nextId = () => `m${++messageCounter}`;

export default function AIChatScreen() {
  const { sessionId: routeSessionId, initial } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [topic, setTopic] = useState("General Mathematics");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showJump, setShowJump] = useState(false);
  // "new" (from the landing screen or a curriculum objective) has no real session yet; the id arrives with
  // the first reply. A numeric id comes from chat history and loads that conversation.
  const [sessionId, setSessionId] = useState(() => {
    const parsed = Number(routeSessionId);
    return Number.isFinite(parsed) ? parsed : null;
  });
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);

  const updateLast = useCallback((change) => {
    setMessages((list) => {
      if (list.length === 0) return list;
      const last = list[list.length - 1];
      if (last.isUser) return list;
      return [...list.slice(0, -1), { ...last, ...change(last) }];
    });
  }, []);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || thinking) return;
    setInput("");
    stickToBottom.current = true;
    setMessages((list) => [
      ...list,
      { id: nextId(), isUser: true, content: question },
      { id: nextId(), isUser: false, content: "", isRefusal: false, geogebra: null },
    ]);
    setThinking(true);
    try {
      await askAIStream(
        { topic, question, session_id: sessionId ?? undefined },
        {
          onToken: (token) => updateLast((last) => ({ content: last.content + token })),
          onGeoGebra: (geo) => updateLast(() => ({ geogebra: geo })),
          // Keep the real session id from the first reply so later turns share one server-side conversation.
          onDone: (info) => {
            const id = typeof info === "object" && info !== null ? info.sessionId : info;
            const refusal = typeof info === "object" && info !== null ? Boolean(info.isRefusal) : false;
            setSessionId(id ?? null);
            updateLast(() => ({ isRefusal: refusal }));
          },
        },
      );
    } catch {
      updateLast(() => ({ content: "Sorry, I couldn't reach the tutor. Please try again.", isRefusal: false }));
    } finally {
      setThinking(false);
    }
  };

  useEffect(() => {
    const parsed = Number(routeSessionId);
    if (Number.isFinite(parsed)) {
      // Opened from chat history: load the stored conversation.
      setLoadingSession(true);
      fetchSession(parsed)
        .then((session) => {
          setMessages(
            (session?.messages || []).map((m) => ({
              id: nextId(),
              isUser: m.role === "user",
              content: m.content,
              isRefusal: Boolean(m.is_refusal),
              geogebra: m.geogebra ?? null,
            })),
          );
        })
        .catch(() => setMessages([])) // deleted or not yours: start blank instead of crashing
        .finally(() => setLoadingSession(false));
    } else if (initial) {
      send(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distance = contentSize.height - contentOffset.y - layoutMeasurement.height;
    stickToBottom.current = distance < 80;
    setShowJump(distance > 160);
  };

  const scrollToBottom = (animated = true) => scrollRef.current?.scrollToEnd({ animated });

  const last = messages[messages.length - 1];
  const showFollowUps = !thinking && last && !last.isUser && last.content && !last.isRefusal;
  const isEmpty = messages.length === 0 && !loadingSession;

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="AI tutor chat">
      <Screen>
        <View className="h-14 flex-row items-center justify-between px-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
          >
            <MaterialIcon name="arrow_back" size={22} color="on-surface" />
          </Pressable>

          <Pressable
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Topic: ${topic}. Change topic`}
            className="max-w-[60%] items-center rounded-full px-3 py-1 active:bg-surface-container"
          >
            <Text className="text-[16px] font-semibold text-on-surface">AI Tutor</Text>
            <View className="flex-row items-center">
              <Text className="text-[12px] text-on-surface-variant" numberOfLines={1}>{topic}</Text>
              <MaterialIcon name="expand_more" size={16} color="on-surface-variant" />
            </View>
          </Pressable>

          <View className="flex-row">
            <Pressable
              onPress={() => router.replace("/(student)/(tabs)/ai-tutor")}
              accessibilityRole="button"
              accessibilityLabel="New chat"
              className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
            >
              <MaterialIcon name="edit" size={20} color="on-surface-variant" />
            </Pressable>
            <Pressable
              onPress={() => router.push("/(student)/ai-tutor/history")}
              accessibilityRole="button"
              accessibilityLabel="Chat history"
              className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
            >
              <MaterialIcon name="history" size={22} color="on-surface-variant" />
            </Pressable>
          </View>
        </View>

        <KeyboardScreen className="flex-1">
          <View className="flex-1">
            {loadingSession ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#006591" />
              </View>
            ) : isEmpty ? (
              <View className="flex-1 justify-center px-6">
                <Text className="text-center text-[22px] font-semibold text-on-surface">What are we solving?</Text>
                <Text className="mb-6 mt-1 text-center text-[14px] text-on-surface-variant">
                  Ask anything in {topic.toLowerCase()} and I'll walk you through it.
                </Text>
                <View className="gap-2">
                  {STARTERS.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => send(s)}
                      accessibilityRole="button"
                      className="rounded-2xl bg-surface-container-lowest px-4 py-3 shadow-level-1 active:opacity-70"
                    >
                      <Text className="text-[15px] text-on-surface">{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <ScrollView
                ref={scrollRef}
                onScroll={handleScroll}
                scrollEventThrottle={32}
                onContentSizeChange={() => stickToBottom.current && scrollToBottom(false)}
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="px-4 pt-3 pb-4"
                showsVerticalScrollIndicator={false}
              >
                {messages.map((m, index) => (
                  <MessageBubble
                    key={m.id}
                    isUser={m.isUser}
                    content={m.content}
                    isRefusal={m.isRefusal}
                    geogebra={m.geogebra}
                    streaming={thinking && index === messages.length - 1}
                  />
                ))}
              </ScrollView>
            )}

            {showJump ? (
              <Pressable
                onPress={() => scrollToBottom(true)}
                accessibilityRole="button"
                accessibilityLabel="Scroll to latest message"
                className="absolute bottom-3 h-10 w-10 items-center justify-center self-center rounded-full bg-surface-container-lowest shadow-level-2"
              >
                <MaterialIcon name="keyboard_arrow_down" size={22} color="on-surface" />
              </Pressable>
            ) : null}
          </View>

          <View className="px-4 pb-3 pt-1">
            {showFollowUps ? (
              <ScrollView
                horizontal
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 pb-3"
              >
                {FOLLOW_UPS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => send(s)}
                    accessibilityRole="button"
                    accessibilityLabel={`Ask: ${s}`}
                    className="rounded-xl bg-surface-container-lowest px-3.5 py-2 shadow-level-1 active:opacity-70"
                  >
                    <Text className="text-[13px] font-medium text-on-surface-variant">{s}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
            <ChatComposer value={input} onChangeText={setInput} onSend={() => send()} busy={thinking} />
          </View>
        </KeyboardScreen>
      </Screen>

      <TopicPicker visible={pickerOpen} value={topic} onSelect={setTopic} onClose={() => setPickerOpen(false)} />
    </SafeAreaView>
  );
}