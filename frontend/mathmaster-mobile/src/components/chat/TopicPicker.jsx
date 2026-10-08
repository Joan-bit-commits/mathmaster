import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MaterialIcon from "../ui/MaterialIcon";

export const TUTOR_TOPICS = [
  "General Mathematics",
  "Algebra",
  "Geometry",
  "Trigonometry",
  "Calculus",
  "Statistics",
];

/** Bottom sheet for choosing what the tutor should focus on. */
export default function TopicPicker({ visible, value, onSelect, onClose }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose} accessibilityLabel="Close topic picker">
        <Pressable
          onPress={() => {}}
          className="rounded-t-2xl bg-surface-container-lowest px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-outline-variant" />
          <Text className="mb-2 text-[18px] font-semibold text-on-surface">Choose a topic</Text>
          {TUTOR_TOPICS.map((topic) => {
            const selected = topic === value;
            return (
              <Pressable
                key={topic}
                onPress={() => {
                  onSelect(topic);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={`flex-row items-center justify-between rounded-xl px-3 py-3.5 active:opacity-70 ${selected ? "bg-primary-fixed" : ""}`}
              >
                <Text className={`text-[16px] ${selected ? "font-semibold text-primary" : "text-on-surface"}`}>{topic}</Text>
                {selected ? <MaterialIcon name="check" size={20} color="primary" /> : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}