import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import MaterialIcon from "../ui/MaterialIcon";

const SYMBOLS = ["²", "√", "π", "÷", "×", "≤", "≥", "∫", "Σ"];
const MIN_HEIGHT = 24;
const MAX_HEIGHT = 120;

/**
 * Message box: rounded, auto-growing, with a one-tap maths symbol strip (phone keyboards bury these).
 * Controlled by the parent so the same component serves the landing screen and the chat screen.
 */
export default function ChatComposer({
  value,
  onChangeText,
  onSend,
  busy = false,
  placeholder = "Message MathMaster…",
  autoFocus = false,
  className = "",
}) {
  const [focused, setFocused] = useState(false);
  const [symbolsOpen, setSymbolsOpen] = useState(false);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const canSend = value.trim().length > 0 && !busy;

  return (
    <View className={className}>
      {symbolsOpen ? (
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="always"
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 pb-2.5"
          accessibilityLabel="Maths symbols"
        >
          {SYMBOLS.map((symbol) => (
            <Pressable
              key={symbol}
              onPress={() => onChangeText(value + symbol)}
              accessibilityRole="button"
              accessibilityLabel={`Insert ${symbol}`}
              className="h-9 min-w-[40px] items-center justify-center rounded-xl bg-surface-container px-3 active:opacity-70"
            >
              <Text className="text-[16px] font-medium text-on-surface">{symbol}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View
        className={`flex-row items-end rounded-2xl bg-surface-container-lowest py-1.5 pl-1.5 pr-1.5 ${focused ? "shadow-level-2" : "shadow-level-1"}`}
      >
        <Pressable
          onPress={() => setSymbolsOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={symbolsOpen ? "Hide maths symbols" : "Show maths symbols"}
          accessibilityState={{ selected: symbolsOpen }}
          className={`mb-0.5 h-10 w-10 items-center justify-center rounded-xl ${symbolsOpen ? "bg-primary-fixed" : ""}`}
        >
          <Text className={`text-[18px] font-semibold ${symbolsOpen ? "text-primary" : "text-outline"}`}>Σ</Text>
        </Pressable>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#8b96a3"
          multiline
          autoFocus={autoFocus}
          onContentSizeChange={(e) =>
            setHeight(Math.min(Math.max(e.nativeEvent.contentSize.height, MIN_HEIGHT), MAX_HEIGHT))
          }
          style={{ height: height + 16 }}
          className="flex-1 px-2 py-2 text-[16px] leading-6 text-on-surface"
          accessibilityLabel="Message input"
        />

        <Pressable
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !canSend }}
          className={`mb-0.5 h-10 w-10 items-center justify-center rounded-xl ${canSend ? "bg-primary" : "bg-surface-container-high"}`}
        >
          <MaterialIcon name="arrow_upward" size={20} color={canSend ? "on-primary" : "outline"} />
        </Pressable>
      </View>
    </View>
  );
}