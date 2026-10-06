import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  fetchDocument,
  pollDocumentUntilProcessed,
  reprocessDocument,
} from "../../../src/services/documents";
import useDocumentQA from "../../../src/hooks/useDocumentQA";
import Screen from "../../../src/components/ui/Screen";
import ModeTabs from "../../../src/components/ui/ModeTabs";
import LatexText from "../../../src/components/ui/LatexText";
import DocumentViewer from "../../../src/components/ui/DocumentViewer";
import MaterialIcon from "../../../src/components/ui/MaterialIcon";
import LoadingSkeleton from "../../../src/components/ui/LoadingSkeleton";
import QuickPromptChips from "../../../src/components/ui/QuickPromptChips";
import CitationChip from "../../../src/components/ui/CitationChip";
import { cleanMathText } from "../../../src/lib/mathText";

export default function DocumentDetail() {
  const { id } = useLocalSearchParams();
  const [document, setDocument] = useState(null);
  const [mode, setMode] = useState("Ask");
  const [question, setQuestion] = useState("");

  // Read tab state: the original file is shown in a native PDF/image
  // viewer. activePage is controlled here so the prev/next buttons and
  // citation taps (see jumpToPage below) can drive the viewer.
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const qa = useDocumentQA(id);

  useEffect(() => {
    let cancelled = false;
    fetchDocument(id).then((doc) => {
      if (cancelled) return;
      setDocument(doc);
      if (
        doc.processing_status === "pending" ||
        doc.processing_status === "processing"
      ) {
        pollDocumentUntilProcessed(id).then((updated) => {
          if (!cancelled) setDocument(updated);
        });
      }
    });
    qa.loadSessions();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const jumpToPage = (page) => {
    if (!page) return;
    setActivePage(page);
    setMode("Read");
  };

  if (!document) {
    return (
      <Screen className="flex-1 bg-background">
        <View className="px-6 pt-6 gap-3">
          <LoadingSkeleton variant="text" className="h-6 w-2/3" />
          <LoadingSkeleton variant="text" className="h-4 w-1/3" />
          <LoadingSkeleton variant="card" className="mt-4 h-32" />
        </View>
      </Screen>
    );
  }

  const stillProcessing =
    document.processing_status === "pending" ||
    document.processing_status === "processing";

  return (
    <Screen className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 30 }}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcon name="arrow_back" size={24} color="on-surface" />
          </Pressable>
          <View className="flex-1">
            <Text numberOfLines={1} className="font-title-lg text-on-surface">
              {document.title}
            </Text>
            <View className="flex-row items-center gap-2">
              <View
                className={`h-2 w-2 rounded-full ${
                  document.processing_status === "ready"
                    ? "bg-primary"
                    : document.processing_status === "failed"
                      ? "bg-error"
                      : "bg-outline-variant"
                }`}
              />
              <Text className="font-body-sm text-on-surface-variant">
                {document.page_count || "?"} pages
              </Text>
            </View>
          </View>
        </View>
        {stillProcessing && (
          <View className="mt-4 rounded-2xl bg-surface-container-lowest p-4 flex-row items-center gap-3">
            <ActivityIndicator color="#006591" />
            <Text className="font-body-md text-on-surface-variant flex-1">
              Still processing this document — content will appear here once
              it's ready.
            </Text>
          </View>
        )}
        {document.processing_status === "failed" && (
          <View className="mt-4 rounded-2xl bg-error-container p-4">
            <Text className="font-body-md text-on-error-container">
              Processing failed
              {document.processing_error
                ? `: ${document.processing_error}`
                : "."}
            </Text>
            <Pressable
              onPress={() => {
                setDocument({ ...document, processing_status: "processing" });
                reprocessDocument(id)
                  .then(() => pollDocumentUntilProcessed(id))
                  .then(setDocument)
                  .catch(() =>
                    setDocument({ ...document, processing_status: "failed" })
                  );
              }}
              accessibilityRole="button"
              accessibilityLabel="Retry processing this document"
              className="mt-3 self-start rounded-full bg-on-error-container px-4 py-2"
            >
              <Text className="font-label-sm text-error-container">Try again</Text>
            </Pressable>
          </View>
        )}
        <ModeTabs
          value={mode}
          onChange={setMode}
          options={["Read", "Ask", "Sessions"]}
          className="mt-5"
        />
        {mode === "Read" && (
          <View className="mt-5">
            {totalPages > 1 && (
              <View className="flex-row items-center justify-between mb-3">
                <Pressable
                  onPress={() => setActivePage((page) => Math.max(1, page - 1))}
                  disabled={activePage <= 1}
                  accessibilityRole="button"
                  accessibilityLabel="Previous page"
                  className="h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest"
                >
                  <MaterialIcon
                    name="chevron_left"
                    size={20}
                    color={activePage <= 1 ? "on-surface-variant" : "on-surface"}
                  />
                </Pressable>
                <Text className="font-label-sm text-on-surface-variant">
                  Page {activePage} of {totalPages}
                </Text>
                <Pressable
                  onPress={() =>
                    setActivePage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={activePage >= totalPages}
                  accessibilityRole="button"
                  accessibilityLabel="Next page"
                  className="h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest"
                >
                  <MaterialIcon
                    name="chevron_right"
                    size={20}
                    color={
                      activePage >= totalPages ? "on-surface-variant" : "on-surface"
                    }
                  />
                </Pressable>
              </View>
            )}
            <DocumentViewer
              documentId={id}
              fileType={document.file_type}
              page={activePage}
              onLoaded={setTotalPages}
              onPageChanged={setActivePage}
            />
          </View>
        )}
        {mode === "Ask" && (
          <View className="mt-5">
            {qa.messages.length === 0 && !qa.isStreaming && (
              <View className="items-center rounded-2xl bg-surface-container-lowest p-6 mb-4">
                <MaterialIcon name="forum" size={28} color="on-surface-variant" />
                <Text className="font-body-md mt-2 text-center text-on-surface-variant">
                  Ask anything about this document — answers are grounded in
                  its actual content, with page citations you can tap.
                </Text>
              </View>
            )}
            {qa.messages.length === 0 && (
              <QuickPromptChips
                prompts={[
                  "Summarise this chapter",
                  "Explain the worked example",
                  "What mistakes should I avoid?",
                ]}
                onSelect={setQuestion}
              />
            )}
            <View className="mt-5 gap-3">
              {qa.messages.map((message, index) => (
                <View
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl p-4 ${message.role === "user" ? "ml-8 bg-primary-fixed" : "mr-8 bg-surface-container-lowest"}`}
                >
                  <LatexText className="font-body-md text-on-surface">
                    {message.content}
                  </LatexText>
                  {message.role === "assistant" && message.citations?.length > 0 && (
                    <View className="mt-3 flex-row flex-wrap gap-2">
                      {message.citations.map((citation, ci) => (
                        <CitationChip
                          key={`${citation.chunk_id || citation.page}-${ci}`}
                          page={citation.page}
                          onPress={() => jumpToPage(citation.page)}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ))}
              {qa.isStreaming && (
                <View className="mr-8 rounded-2xl bg-surface-container-lowest p-4">
                  {/* Deliberately plain Text + cleanMathText here, not
                      LatexText: a formula only becomes a complete $...$
                      pair once its closing delimiter has actually
                      streamed in, and every token after that would
                      otherwise remount LatexText's WebView from scratch
                      (its source={{html}} changes identity on every
                      keystroke-sized update) — expensive and visually
                      jumpy mid-stream. cleanMathText gives a readable
                      Unicode approximation while streaming; the message
                      re-renders through full LatexText/KaTeX once it's
                      pushed into qa.messages and streaming ends. */}
                  <Text className="font-body-md text-on-surface">
                    {cleanMathText(qa.currentAnswer)}
                  </Text>
                  {qa.currentCitations.length > 0 && (
                    <View className="mt-3 flex-row flex-wrap gap-2">
                      {qa.currentCitations.map((citation, ci) => (
                        <CitationChip
                          key={`${citation.chunk_id || citation.page}-${ci}`}
                          page={citation.page}
                          onPress={() => jumpToPage(citation.page)}
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
            <View className="mt-5 flex-row items-end rounded-2xl bg-surface-container-lowest p-2">
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="Ask about this document"
                placeholderTextColor="#6e7881"
                className="max-h-24 flex-1 px-2 py-2 text-on-surface"
                multiline
                accessibilityLabel="Document question"
              />
              <Pressable
                onPress={() => {
                  if (stillProcessing) return;
                  qa.sendQuestion(question);
                  setQuestion("");
                }}
                disabled={stillProcessing}
                className={`h-10 w-10 items-center justify-center rounded-full ${stillProcessing ? "bg-surface-container" : "bg-primary"}`}
                accessibilityRole="button"
                accessibilityLabel="Send document question"
              >
                <Text className="text-[20px] text-white">↑</Text>
              </Pressable>
            </View>
          </View>
        )}
        {mode === "Sessions" && (
          <View className="mt-5 gap-3">
            <Pressable
              onPress={() => {
                qa.startNewConversation();
                setMode("Ask");
              }}
              className="flex-row items-center gap-2 rounded-2xl border border-dashed border-outline-variant p-4"
              accessibilityRole="button"
              accessibilityLabel="Start a new conversation"
            >
              <MaterialIcon name="add" size={18} color="primary" />
              <Text className="font-label-sm text-primary">New conversation</Text>
            </Pressable>
            {qa.loadingSession && <LoadingSkeleton variant="card" className="h-16" />}
            {(qa.sessions || []).length === 0 && !qa.loadingSession && (
              <Text className="font-body-sm text-on-surface-variant">
                No past conversations for this document yet.
              </Text>
            )}
            {(qa.sessions || []).map((session) => (
              <Pressable
                key={session.id}
                onPress={async () => {
                  await qa.selectSession(session);
                  setMode("Ask");
                }}
                className={`rounded-2xl p-4 ${qa.currentSession?.id === session.id ? "bg-primary-fixed" : "bg-surface-container-lowest"}`}
                accessibilityRole="button"
                accessibilityLabel={`Open session ${session.title}`}
              >
                <Text className="font-title-lg text-on-surface">
                  {session.title || "Document chat"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}