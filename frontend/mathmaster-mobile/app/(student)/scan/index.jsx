import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Screen from "../../../src/components/ui/Screen";
import MaterialIcon from "../../../src/components/ui/MaterialIcon";
import CaptureFAB from "../../../src/components/ui/CaptureFAB";
import useScan from "../../../src/hooks/useScan";

export default function ScanHome() {
  const { history } = useScan();

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });
      if (!result.canceled) {
        router.push({
          pathname: "/(student)/scan/review",
          params: { uri: result.assets[0].uri },
        });
      }
    } catch (e) {
      console.warn("Gallery picker failed:", e);
    }
  };

  const tiles = [
    {
      icon: "photo_camera",
      title: "Snap a problem",
      body: "Take a clear photo of your working.",
      onPress: () => router.push("/(student)/scan/camera"),
    },
    {
      icon: "upload_file",
      title: "Upload an image",
      body: "Choose a problem from your gallery.",
      onPress: pickFromGallery,
    },
    {
      icon: "history",
      title: "Review my work",
      body: "Return to recent solutions.",
      onPress: () => router.push("/(student)/scan/history"),
    },
  ];

  return (
    <Screen className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}
      >
        <Text className="font-headline-md text-on-surface">Snap & Solve</Text>
        <Text className="font-body-md mt-1 text-on-surface-variant">
          Turn a math problem into a guided solution.
        </Text>

        <View className="mt-6 gap-3">
          {tiles.map((tile) => (
            <Pressable
              key={tile.title}
              onPress={tile.onPress}
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

        <Text className="font-title-lg mt-8 text-on-surface">Recent scans</Text>
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

      <CaptureFAB
        className="absolute bottom-8 right-6"
        onPress={() => router.push("/(student)/scan/camera")}
      />
    </Screen>
  );
}