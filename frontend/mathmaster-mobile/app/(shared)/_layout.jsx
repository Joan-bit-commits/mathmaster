import { Stack } from 'expo-router';
import React from 'react';

export default function SharedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f8f9ff' } }}>
      <Stack.Screen name="settings" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="search" presentation="fullScreenModal" animation="slide_from_bottom" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="empty-topics" />
      <Stack.Screen name="offline" />
      <Stack.Screen name="404" />
    </Stack>
  );
}
