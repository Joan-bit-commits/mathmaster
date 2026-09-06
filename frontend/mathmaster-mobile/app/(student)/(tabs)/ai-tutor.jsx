import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
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
import CaptureFAB from "../../../src/components/ui/CaptureFAB";
import DocumentCard from "../../../src/components/ui/DocumentCard";
import KeyboardScreen from "../../../src/components/ui/KeyboardScreen";
import MaterialIcon from "../../../src/components/ui/MaterialIcon";
import ModeErrorBoundary from "../../../src/components/ui/ModeErrorBoundary";
import ModeTabs from "../../../src/components/ui/ModeTabs";
import Screen from "../../../src/components/ui/Screen";
import useScan from "../../../src/hooks/useScan";
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';
import { fetchDocuments } from "../../../src/services/documents";
import { useDocumentsStore } from "../../../src/stores/documentsStore";
import { ta } from "zod/v4/locales";

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

const SCAN_TILES = [
  {
    icon: "photo_camera",
    title: "Snap a problem",
    body: "Take a clear photo of your working.",
    path: "/(student)/scan/camera",
  },
  {
    icon: "upload_file",
    title: "Upload an image",
    body: "Choose a problem from your gallery.",
    path: "/(student)/scan/review",
  },
];

const MIN_INPUT_HEIGHT = 24;
const MAX_INPUT_HEIGHT = 100;

// ---------- Chat panel ----------
function ChatPanel() {
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
    <KeyboardScreen className="flex-1">
      <View className="flex-1 justify-center px-[24px]">
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
                  Math.max(e.nativeEvent.contentSize.height, MIN_INPUT_HEIGHT),
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
  );
}

// ---------- Scan panel — hooks only run once this mode mounts ----------
function ScanPanel() {
  const { history: scanHistory } = useScan();

  return (
    <ScrollView
      className="flex-1 px-6"
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="font-body-md text-on-surface-variant mb-4">
        Turn a math problem into a guided solution.
      </Text>
      <View className="gap-3">
        {SCAN_TILES.map((tile) => (
          <Pressable
            key={tile.title}
            onPress={() => router.push(tile.path)}
            className="flex-row items-center rounded-2xl bg-surface-container-lowest p-4 shadow-level-1"
            accessibilityRole="button"
            accessibilityLabel={tile.title}
          >
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-fixed">
              <MaterialIcon name={tile.icon} size={24} color="primary" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-title-lg text-on-surface">
                {tile.title}
              </Text>
              <Text className="font-body-sm mt-1 text-on-surface-variant">
                {tile.body}
              </Text>
            </View>
            <MaterialIcon name="chevron_right" size={22} color="outline" />
          </Pressable>
        ))}
      </View>

      <Text className="font-title-lg mt-8 mb-1 text-on-surface">
        Recent scans
      </Text>
      {scanHistory?.length ? (
        scanHistory.map((scan) => (
          <Pressable
            key={scan.id}
            onPress={() =>
              router.push({
                pathname: "/(student)/scan/result",
                params: { id: scan.id },
              })
            }
            className="mt-3 rounded-2xl bg-surface-container-lowest p-4"
            accessibilityRole="button"
            accessibilityLabel={`Open scan ${scan.detected_topic}`}
          >
            <View className="flex-row justify-between">
              <Text className="font-label-sm text-primary">
                {scan.detected_uneb_code}
              </Text>
              <Text className="font-body-sm text-on-surface-variant">
                {scan.status}
              </Text>
            </View>
            <Text className="font-body-md mt-2 text-on-surface">
              {scan.problem_text}
            </Text>
          </Pressable>
        ))
      ) : (
        <Text className="font-body-md mt-3 text-on-surface-variant">
          Your solved problems will appear here.
        </Text>
      )}
    </ScrollView>
  );
}

// ---------- Doc panel — hooks only run once this mode mounts ----------
function DocPanel() {
  const { documents, setDocuments } = useDocumentsStore();

  useEffect(() => {
    if (documents.length === 0) {
      fetchDocuments().then(setDocuments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FlatList
      data={documents}
      numColumns={2}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ padding: 24, paddingBottom: 140, gap: 12 }}
      columnWrapperStyle={{ gap: 12 }}
      ListHeaderComponent={
        <Text className="font-body-md mb-4 text-on-surface-variant">
          Ask questions about your notes and textbooks.
        </Text>
      }
      renderItem={({ item }) => (
        <DocumentCard
          document={item}
          className="flex-1"
          onPress={() =>
            router.push({
              pathname: "/(student)/documents/[id]",
              params: { id: item.id },
            })
          }
        />
      )}
      ListEmptyComponent={
        <Text className="font-body-md text-on-surface-variant">
          No documents yet. Upload a PDF to start.
        </Text>
      }
    />
  );
}

// ---------- Screen ----------
export default function AITutorNewChatScreen() {
  const [mode, setMode] = useState("Chat");
  const tabBarSpacing = useTabBarSpacing();

  const fab =
    mode === "Scan"
      ? {
          onPress: () => router.push("/(student)/scan/camera"),
          label: "Capture a problem",
        }
      : mode === "Doc"
        ? {
            onPress: () => router.push("/(student)/documents/upload"),
            label: "Upload a document",
          }
        : null;

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      accessibilityLabel="AI tutor"
    >
      <Screen>
        <ModeTabs className="mx-6 mt-2" value={mode} onChange={setMode} />

        <View className="flex-row items-center justify-between h-16 px-[24px]">
          <View className="flex-row items-center gap-2">
            <MaterialIcon
              name={
                mode === "Scan"
                  ? "document_scanner"
                  : mode === "Doc"
                    ? "folder"
                    : "smart_toy"
              }
              size={24}
              color="primary"
            />
            <Text className="text-[24px] leading-8 font-semibold text-primary">
              {mode === "Scan"
                ? "Snap & Solve"
                : mode === "Doc"
                  ? "My documents"
                  : "AI Tutor"}
            </Text>
          </View>
          {mode === "Chat" && (
            <Button
              variant="icon"
              onPress={() => router.push("/(student)/ai-tutor/history")}
              accessibilityLabel="Chat history"
            >
              <MaterialIcon
                name="history"
                size={22}
                color="on-surface-variant"
              />
            </Button>
          )}
        </View>

        {/* Each mode only mounts (and only calls its own hooks) once selected. */}
        {mode === "Chat" && <ChatPanel />}

        {mode === "Scan" && (
          <ModeErrorBoundary resetKey={mode}>
            <ScanPanel />
          </ModeErrorBoundary>
        )}

        {mode === "Doc" && (
          <ModeErrorBoundary resetKey={mode}>
            <DocPanel />
          </ModeErrorBoundary>
        )}

        {fab && (
        <CaptureFAB
          style={{ bottom: tabBarSpacing + 24, left: 290 }}
          onPress={fab.onPress}
          accessibilityLabel={fab.label}
        />
      )}
      </Screen>
    </SafeAreaView>
  );
}
