import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import MaterialIcon from "./MaterialIcon";

export default function DocumentCard({ document, onPress, className = "" }) {
  const status = document.processing_status || document.status || "ready";
  const tone =
    status === "ready"
      ? "bg-[#d5f5d5] text-[#1d5c22]"
      : status === "failed"
        ? "bg-error-container text-on-error-container"
        : "bg-tertiary-fixed text-on-tertiary-fixed";
  return (
    <Pressable
      onPress={onPress}
      className={`overflow-hidden rounded-2xl bg-surface-container-lowest shadow-level-1 ${className}`}
      accessibilityRole="button"
      accessibilityLabel={`Open document ${document.title}`}
    >
      <View className="h-28 items-center justify-center bg-surface-container-high">
        {document.thumbnail ? (
          <Image
            source={{ uri: document.thumbnail }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <MaterialIcon name="description" size={40} color="outline" />
        )}
      </View>
      <View className="p-3">
        <Text numberOfLines={2} className="font-title-lg text-on-surface">
          {document.title}
        </Text>
        <Text className="font-body-sm mt-1 text-on-surface-variant">
          {document.page_count
            ? `${document.page_count} pages`
            : document.document_type || "Document"}
        </Text>
        <Text
          className={`mt-2 self-start rounded-full px-2 py-0.5 font-label-sm ${tone}`}
        >
          {status}
        </Text>
      </View>
    </Pressable>
  );
}
