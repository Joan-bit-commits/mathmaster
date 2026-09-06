import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import Screen from "../../../src/components/ui/Screen";
import MaterialIcon from "../../../src/components/ui/MaterialIcon";
import useScan from "../../../src/hooks/useScan";

export default function ScanHistory() {
  const { history } = useScan();

  return (
    <Screen className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 h-14">
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
        </Pressable>
        <Text className="font-title-lg text-on-surface">Recent scans</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}>
        {history.length ? (
          history.map((scan) => (
            <Pressable
              key={scan.id}
              onPress={() =>
                router.push({
                  pathname: "/(student)/scan/result",
                  params: { id: scan.id },
                })
              }
              className="mt-3 rounded-2xl bg-surface-container-lowest p-4 shadow-level-1"
              accessibilityRole="button"
              accessibilityLabel={`Open scan ${scan.detected_topic}`}
            >
              <View className="flex-row justify-between">
                <Text className="font-label-sm text-primary">{scan.detected_uneb_code}</Text>
                <Text className="font-body-sm text-on-surface-variant">{scan.status}</Text>
              </View>
              <Text className="font-body-md mt-2 text-on-surface">{scan.problem_text}</Text>
            </Pressable>
          ))
        ) : (
          <Text className="font-body-md mt-3 text-on-surface-variant">
            Your solved problems will appear here.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}