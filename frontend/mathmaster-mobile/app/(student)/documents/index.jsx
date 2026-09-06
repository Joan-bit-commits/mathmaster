import React, { useEffect } from "react";
import { FlatList, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DocumentCard from "../../../src/components/ui/DocumentCard";
import CaptureFAB from "../../../src/components/ui/CaptureFAB";
import Screen from "../../../src/components/ui/Screen";
import { fetchDocuments } from "../../../src/services/documents";
import { useDocumentsStore } from "../../../src/stores/documentsStore";

export default function DocumentsIndex() {
  const { documents, setDocuments } = useDocumentsStore();
  const insets = useSafeAreaInsets();
console.log("📄 DocumentsIndex insets:", insets);

  useEffect(() => {
    fetchDocuments().then(setDocuments);
  }, [setDocuments]);

  return (
    <Screen className="flex-1 bg-background">
      <View className="px-6 pt-6">
        <Text className="font-headline-md text-on-surface">My documents</Text>
        <Text className="font-body-md mt-1 text-on-surface-variant">
          Ask questions about your notes and textbooks.
        </Text>
      </View>

      <FlatList
        data={documents}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 24, paddingBottom: 120, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
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

      <CaptureFAB
        className="absolute right-6"
        style={{ bottom: insets.bottom + 24 }}
        onPress={() => router.push("/(student)/documents/upload")}
      />
    </Screen>
  );
}