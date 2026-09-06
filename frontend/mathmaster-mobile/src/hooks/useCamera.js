import { useCameraPermissions } from "expo-camera";
import { useCallback, useRef, useState } from "react";

export default function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [flashMode, setFlashMode] = useState("off");
  const [facing, setFacing] = useState("back");
  const [isReady, setReady] = useState(false);

  const takePicture = useCallback(
    async () => cameraRef.current?.takePictureAsync({ quality: 0.85 }),
    [],
  );

  return {
    // Raw permission object: `null`/`undefined` while resolving, `{ granted, canAskAgain, ... }` once resolved.
    // Exposed as-is (not collapsed) so screens can distinguish "still loading" from "denied".
    permission,
    hasPermission: permission?.granted ?? false,
    requestPermission,
    cameraRef,
    takePicture,
    flashMode,
    setFlashMode,
    facing,
    setFacing,
    isReady,
    onCameraReady: () => setReady(true),
  };
}