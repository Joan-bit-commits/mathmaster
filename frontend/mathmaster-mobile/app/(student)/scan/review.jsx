import React from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageCropper from "../../../src/components/ui/ImageCropper";
import Button from "../../../src/components/ui/Button";

export default function ScanReview() {
  const { uri } = useLocalSearchParams();

  if (!uri) {
    return (
      <SafeAreaView className="flex-1 bg-background" accessibilityLabel="No image to review">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-body-md text-on-surface-variant text-center mb-6">
            No image to review. Please scan or upload a problem first.
          </Text>
          <Button
            label="Back to scan"
            onPress={() => router.replace("/(student)/scan")}
            accessibilityLabel="Back to scan"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageCropper
      uri={uri}
      onCancel={() => router.back()}
      onConfirm={(imageUri) =>
        router.push({
          pathname: "/(student)/scan/result",
          params: { uri: imageUri, solve: "true" },
        })
      }
    />
  );
}