import React from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraViewfinder from "../../../src/components/ui/CameraViewfinder";
import Button from "../../../src/components/ui/Button";
import useCamera from "../../../src/hooks/useCamera";

export default function ScanCamera() {
  const camera = useCamera();

  const capture = async () => {
    try {
      const photo = await camera.takePicture();
      if (photo?.uri) {
        router.push({
          pathname: "/(student)/scan/review",
          params: { uri: photo.uri },
        });
      }
    } catch (e) {
      console.warn("Capture failed:", e);
      // TODO: surface a toast/snackbar to the user instead of a silent console warning
    }
  };

  const gallery = async () => {
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

  // expo-camera returns `null` while the permission check is still resolving
  if (camera.permission === null || camera.permission === undefined) {
    return <View className="flex-1 bg-black" accessibilityLabel="Loading camera" />;
  }

  // Resolved, but the user hasn't granted it (or denied it previously)
  if (!camera.permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black" accessibilityLabel="Camera permission required">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-white text-[18px] leading-6 text-center mb-2">
            Camera access needed
          </Text>
          <Text className="text-[#b6c2d2] text-[14px] leading-5 text-center mb-6">
            MathMaster needs your camera to scan and solve math problems from your working.
          </Text>
          <Button
            label="Grant camera permission"
            onPress={camera.requestPermission}
            accessibilityLabel="Grant camera permission"
          />
          <Button
            label="Not now"
            variant="secondary"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            className="mt-3"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <CameraViewfinder
      ref={camera.cameraRef}
      {...camera}
      onCapture={capture}
      onClose={() => router.back()}
      onGallery={gallery}
      onToggleFlash={() =>
        camera.setFlashMode(camera.flashMode === "off" ? "on" : "off")
      }
      onFlip={() =>
        camera.setFacing(camera.facing === "back" ? "front" : "back")
      }
    />
  );
}