import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import Button from "../../../src/components/ui/Button";
import ChatComposer from "../../../src/components/chat/ChatComposer";
import { useAuthStore } from "../../../src/stores/authStore";
import CaptureFAB from "../../../src/components/ui/CaptureFAB";
import DocumentCard from "../../../src/components/ui/DocumentCard";
import KeyboardScreen from "../../../src/components/ui/KeyboardScreen";
import MaterialIcon from "../../../src/components/ui/MaterialIcon";
import ModeErrorBoundary from "../../../src/components/ui/ModeErrorBoundary";
import ModeTabs from "../../../src/components/ui/ModeTabs";
import Screen from "../../../src/components/ui/Screen";
import LatexText from "../../../src/components/ui/LatexText";
import useScan from "../../../src/hooks/useScan";
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';
import { fetchDocuments } from "../../../src/services/documents";
import { useDocumentsStore } from "../../../src/stores/documentsStore";

const QUICK_PROMPTS = [
  { icon: "functions", title: "Solve an equation", prompt: "Help me solve 2x + 5 = 13" },
  { icon: "psychology", title: "Explain a concept", prompt: "What is a Venn diagram?" },
  { icon: "calculate", title: "Check my working", prompt: "Can you check my working?" },
  { icon: "lightbulb", title: "Give me a hint", prompt: "Give me a hint without the full answer" },
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

// ---------- Chat panel ----------
function ChatPanel() {
  const [message, setMessage] = useState("");
  const user = useAuthStore((state) => state.user);
  const name = user?.first_name || user?.username || "there";

  const send = (text) => {
    const question = (text ?? message).trim();
    if (!question) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setMessage("");
    router.push({ pathname: "/(student)/ai-tutor/chat/new", params: { initial: question } });
  };

  return (
    <KeyboardScreen className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(300)} className="mb-6 items-center">
          <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-primary">
            <MaterialIcon name="auto_awesome" size={24} color="on-primary" />
          </View>
          <Text className="text-center text-[26px] font-semibold leading-8 text-on-surface">Hi {name}</Text>
          <Text className="mt-1 text-center text-[15px] leading-5 text-on-surface-variant">
            What are we solving today?
          </Text>
        </Animated.View>

        <ChatComposer value={message} onChangeText={setMessage} onSend={() => send()} />

        <View className="mt-5 flex-row flex-wrap gap-3">
          {QUICK_PROMPTS.map((item, i) => (
            <Animated.View
              key={item.title}
              entering={FadeInDown.delay(80 + i * 50).duration(250)}
              style={{ width: "48%", flexGrow: 1 }}
            >
              <Pressable
                onPress={() => send(item.prompt)}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-level-1 active:opacity-70"
              >
                <MaterialIcon name={item.icon} size={20} color="primary" />
                <Text className="mt-2 text-[14px] font-semibold leading-5 text-on-surface">{item.title}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
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
            <LatexText className="font-body-md mt-2 text-on-surface">
              {scan.problem_text}
            </LatexText>
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
    fetchDocuments().then(setDocuments);
  }, [setDocuments]);

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

        <View className="flex-row items-center justify-between h-14 px-[24px]">
          <View className="flex-row items-center gap-2">
            <MaterialIcon
              name={
                mode === "Scan"
                  ? "document_scanner"
                  : mode === "Doc"
                    ? "folder"
                    : "smart_toy"
              }
              size={22}
              color="primary"
            />
            <Text className="text-[20px] leading-7 font-semibold text-on-surface">
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