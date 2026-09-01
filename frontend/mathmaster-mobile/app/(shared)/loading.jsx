import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import LoadingSkeleton from '../../src/components/ui/LoadingSkeleton';
import Screen from '../../src/components/ui/Screen';

/** Generic loading skeleton screen (Suspense fallback). */
export default function LoadingScreen() {
  return (
    <View className="flex-1 bg-background" accessibilityLabel="Loading">
      <Screen>
        <View className="px-[24px] pt-6 gap-4">
          <LoadingSkeleton variant="card" />
          {[...Array(4)].map((_, i) => (
            <View key={i} className="flex-row gap-3 items-center">
              <LoadingSkeleton variant="circle" />
              <View className="flex-1 gap-2">
                <LoadingSkeleton className="w-2/3" />
                <LoadingSkeleton className="w-1/3 h-3" />
              </View>
            </View>
          ))}
        </View>
      </Screen>
    </View>
  );
}
