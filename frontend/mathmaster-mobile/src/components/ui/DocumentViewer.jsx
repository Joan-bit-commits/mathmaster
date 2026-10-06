import React, { useState } from "react";
import { Dimensions, Text, View } from "react-native";
import Pdf from "react-native-pdf";
import { Image } from "expo-image";
import { API_URL } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

/**
 * Renders the original uploaded document from the authenticated
 * /api/documents/:id/file/ endpoint — PDFs with react-native-pdf (native
 * renderer, one page at a time), image uploads with expo-image.
 *
 * `page` is controlled by the parent (prev/next buttons, citation taps);
 * `onPageChanged` reports swipes back so the parent stays in sync.
 */
export default function DocumentViewer({
  documentId,
  fileType = "pdf",
  page = 1,
  onLoaded,
  onPageChanged,
}) {
  const [failed, setFailed] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const height = Math.round(Dimensions.get("window").height * 0.68);
  const uri = `${API_URL}/api/documents/${documentId}/file/`;
  const headers = { Authorization: `Bearer ${accessToken}` };

  if (failed) {
    return (
      <View
        style={{ height: 160 }}
        className="items-center justify-center rounded-2xl bg-surface-container-lowest p-5"
      >
        <Text className="font-body-md text-center text-on-surface-variant">
          Couldn't load this file. Check your connection and try again.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ height }}
      className="overflow-hidden rounded-2xl bg-surface-container-lowest"
    >
      {fileType === "image" ? (
        <Image
          source={{ uri, headers }}
          style={{ flex: 1 }}
          contentFit="contain"
          onError={() => setFailed(true)}
          accessibilityLabel="Document image"
        />
      ) : (
        <Pdf
          source={{ uri, headers, cache: true }}
          page={page}
          horizontal
          enablePaging
          fitPolicy={0}
          style={{ flex: 1, backgroundColor: "transparent" }}
          onLoadComplete={(numberOfPages) => onLoaded?.(numberOfPages)}
          onPageChanged={(current) => onPageChanged?.(current)}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}
