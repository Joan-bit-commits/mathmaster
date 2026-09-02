import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import Button from '../../src/components/ui/Button';
import Screen from '../../src/components/ui/Screen';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 bg-background" accessibilityLabel="Page not found">
      <Screen>
        <View className="flex-1 items-center justify-center px-[24px]">
          <Text className="text-[64px] leading-[72px] font-bold text-primary mb-2">404</Text>
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface mb-2">
            This page took a wrong turn
          </Text>
          <Text className="font-body-md text-body-md text-on-surface-variant text-center mb-8">
            The screen you're looking for doesn't exist (yet).
          </Text>
          <Button label="Go home" onPress={() => router.replace('/(student)')} fullWidth accessibilityLabel="Go home" />
        </View>
      </Screen>
    </View>
  );
}
