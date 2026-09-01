import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import Button from '../../src/components/ui/Button';
import MaterialIcon from '../../src/components/ui/MaterialIcon';
import Screen from '../../src/components/ui/Screen';

export default function OfflineScreen() {
  return (
    <View className="flex-1 bg-background" accessibilityLabel="Offline">
      <Screen>
        <View className="flex-1 items-center justify-center px-[24px]">
          <View className="w-20 h-20 rounded-full bg-surface-container-low items-center justify-center mb-4">
            <MaterialIcon name="cloud_off" size={40} color="outline" />
          </View>
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface mb-2">
            You're offline
          </Text>
          <Text className="font-body-md text-body-md text-on-surface-variant text-center mb-8">
            Check your connection — your progress is saved and will sync when you're back online.
          </Text>
          <View className="w-full gap-3">
            <Button label="Try to reconnect" icon="refresh" onPress={() => router.back()} fullWidth accessibilityLabel="Reconnect" />
            <Button variant="secondary" label="Browse offline content" onPress={() => router.replace('/(student)/(tabs)/topics')} fullWidth accessibilityLabel="Browse offline" />
          </View>
        </View>
      </Screen>
    </View>
  );
}
