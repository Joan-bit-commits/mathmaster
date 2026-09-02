import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../src/components/ui/Button';
import EmptyState from '../../src/components/ui/EmptyState';
import Screen from '../../src/components/ui/Screen';

export default function EmptyTopicsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="No topics">
      <Screen>
        <View className="px-[24px] pt-6">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <Text>←</Text>
          </Button>
        </View>
        <EmptyState
          icon="menu_book"
          title="No topics here yet"
          description="Your class hasn't been given any topics. Pull to refresh, or check back after your next lesson."
          actionLabel="Browse all topics"
          onAction={() => router.replace('/(student)/(tabs)/topics')}
        />
      </Screen>
    </SafeAreaView>
  );
}
