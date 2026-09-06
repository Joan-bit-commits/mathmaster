import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { fetchScanJob, submitScan } from "../../../src/services/scan";
import Screen from "../../../src/components/ui/Screen";
import MaterialIcon from "../../../src/components/ui/MaterialIcon";
import Button from "../../../src/components/ui/Button";
import TopicContextCard from "../../../src/components/ui/TopicContextCard";
import SolutionStep from "../../../src/components/ui/SolutionStep";
import ConfidenceIndicator from "../../../src/components/ui/ConfidenceIndicator";
import LocalContextPill from "../../../src/components/ui/LocalContextPill";
import QuickPromptChips from "../../../src/components/ui/QuickPromptChips";
import UploadProgress from "../../../src/components/ui/UploadProgress";

export default function ScanResult() {
  const { id, uri, solve } = useLocalSearchParams();
  const shouldSolve = solve === "true";

  const [scan, setScan] = useState(null);
  const [tab, setTab] = useState("Solution");
  const [progress, setProgress] = useState(shouldSolve ? 0.2 : 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setError(null);
      setLoading(true);

      if (!shouldSolve && !id) {
        if (!cancelled) {
          setError("No scan to display.");
          setLoading(false);
        }
        return;
      }

      try {
        const result =
          shouldSolve && uri ? await submitScan(uri, setProgress) : await fetchScanJob(id);
        if (!cancelled) setScan(result);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Couldn't load this scan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, uri, shouldSolve]);

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <UploadProgress progress={progress} fileName="math problem" />
      </View>
    );
  }

  if (error || !scan) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Text className="font-body-md text-on-surface-variant text-center mb-6">
          {error || "Something went wrong loading this scan."}
        </Text>
        <Button
          label="Back to scan"
          onPress={() => router.replace("/(student)/scan")}
          accessibilityLabel="Back to scan"
        />
      </View>
    );
  }

  return (
    <Screen className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 22, paddingBottom: 40 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcon name="arrow_back" size={24} color="on-surface" />
          </Pressable>
          <Text className="font-title-lg text-on-surface">Solution</Text>
          <Pressable
            onPress={() => router.push("/(student)/scan/camera")}
            accessibilityRole="button"
            accessibilityLabel="New scan"
          >
            <MaterialIcon name="add" size={24} color="primary" />
          </Pressable>
        </View>

        <TopicContextCard
          className="mt-5"
          topic={scan.detected_topic}
          code={scan.detected_uneb_code}
          level="Uganda curriculum"
          textbook="Mathematics for Uganda Book 1"
          onPress={() =>
            router.push({
              pathname: "/(student)/curriculum/topic",
              params: { code: scan.detected_uneb_code },
            })
          }
        />
        <LocalContextPill className="mt-3" label={scan.context} />

        <View className="mt-5 flex-row rounded-2xl bg-surface-container p-1">
          {["Solution", "Steps", "Similar"].map((item) => (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              className={`flex-1 items-center rounded-xl py-2 ${tab === item ? "bg-surface-container-lowest" : ""}`}
              accessibilityRole="tab"
            >
              <Text
                className={`font-label-sm ${tab === item ? "text-primary" : "text-on-surface-variant"}`}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "Solution" && (
          <View className="mt-5">
            <Text className="font-body-md text-on-surface">
              {scan.problem_text}
            </Text>
            <Text className="font-label-sm mt-6 text-on-surface-variant">
              Final answer
            </Text>
            <Text className="font-headline-md mt-1 text-primary">
              {scan.final_answer}
            </Text>
            <ConfidenceIndicator
              confidence={scan.confidence || 0.9}
              className="mt-3"
            />
          </View>
        )}

        {tab === "Steps" && (
          <View className="mt-5 gap-3">
            {(scan.solution_steps || []).map((step, index) => (
              <SolutionStep
                key={step.step}
                step={step}
                index={index}
                onExplain={() => {}}
              />
            ))}
          </View>
        )}

        {tab === "Similar" && (
          <View className="mt-5">
            <Text className="font-body-md text-on-surface">
              Practise this skill with a local example.
            </Text>
            <QuickPromptChips
              className="mt-4"
              prompts={[
                "Give me a similar problem",
                "Explain the method",
                "Open the syllabus",
              ]}
              onSelect={(prompt) =>
                prompt === "Open the syllabus" &&
                router.push({
                  pathname: "/(student)/curriculum/topic",
                  params: { code: scan.detected_uneb_code },
                })
              }
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}