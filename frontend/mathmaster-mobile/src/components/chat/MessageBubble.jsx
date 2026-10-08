import React from "react";
import { Pressable, Share, Text, View, useWindowDimensions } from "react-native";

import LatexText from "../ui/LatexText";
import MaterialIcon from "../ui/MaterialIcon";
import GeoGebraSketch from "./GeoGebraSketch";
import TypingIndicator from "./TypingIndicator";

function RefusalNotice() {
  return (
    <View className="flex-row gap-3 rounded-xl bg-surface-container px-4 py-3">
      <MaterialIcon name="lock" size={18} color="on-surface-variant" style={{ marginTop: 2 }} />
      <View className="flex-1">
        <Text className="text-[14px] font-semibold leading-5 text-on-surface">
          I can only help with mathematics
        </Text>
        <Text className="mt-1 text-[13px] leading-5 text-on-surface-variant">
          Try a question about algebra, geometry, trigonometry, calculus, statistics or any other maths topic.
        </Text>
      </View>
    </View>
  );
}

/**
 * One chat turn. The learner's message is a solid bubble on the right; the tutor's reply is plain text
 * on the page beside a small avatar — easier to read for long, step-by-step working.
 * Memoised, so finished messages don't re-render (or re-typeset) while a new reply streams in.
 */
function MessageBubble({ isUser, content, isRefusal, geogebra, streaming }) {
  const { width } = useWindowDimensions();

  if (isUser) {
    return (
      <View className="mb-5 max-w-[85%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-2.5">
        <LatexText className="text-[16px] leading-6 text-on-primary" color="#ffffff" maxWidthRatio={0.7}>
          {content}
        </LatexText>
      </View>
    );
  }

  const empty = !content;
  // Screen width minus page padding (32), avatar (28) and gap (12) — LatexText needs an explicit width for math.
  const textRatio = Math.max(0.5, (width - 72) / width);

  return (
    <View className="mb-6 flex-row gap-3">
      <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-primary-fixed">
        <MaterialIcon name="auto_awesome" size={15} color="primary" />
      </View>
      <View className="min-w-0 flex-1">
        {empty ? (
          <TypingIndicator />
        ) : isRefusal ? (
          <RefusalNotice />
        ) : (
          <>
            <LatexText className="text-[16px] leading-6 text-on-surface" color="#0b1c30" maxWidthRatio={textRatio}>
              {content}
            </LatexText>
            {geogebra && !streaming ? <GeoGebraSketch payload={geogebra} height={340} /> : null}
          </>
        )}
        {!empty && !streaming && !isRefusal ? (
          <Pressable
            onPress={() => Share.share({ message: content }).catch(() => {})}
            accessibilityRole="button"
            accessibilityLabel="Share this answer"
            hitSlop={8}
            className="mt-2 flex-row items-center gap-1.5 self-start rounded-full py-1 active:opacity-60"
          >
            <MaterialIcon name="share" size={15} color="outline" />
            <Text className="text-[12px] font-medium text-outline">Share</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default React.memo(MessageBubble);