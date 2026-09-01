import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import Screen from '../../src/components/ui/Screen';

function strengthOf(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['#ba1a1a', '#ba1a1a', '#d88a00', '#8bc34a', '#2e7d32'];

export default function ChangePasswordScreen() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const score = strengthOf(next);

  return (
    <View className="flex-1 bg-background" accessibilityLabel="Change password">
      <Screen>
        <View className="flex-row items-center gap-3 px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <BackIcon />
          </Button>
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">Change password</Text>
        </View>
        <ScrollView contentContainerClassName="px-[24px] pb-10" keyboardShouldPersistTaps="handled">
          <Input label="Current password" value={current} onChangeText={setCurrent} secureTextEntry leftIcon="lock" textContentType="password" />
          <Input label="New password" value={next} onChangeText={setNext} secureTextEntry leftIcon="lock" textContentType="newPassword" helperText="8+ chars, uppercase, digit." />
          {next ? (
            <View className="mb-4" accessibilityLabel={`Password strength: ${LABELS[score]}`}>
              <View className="flex-row gap-1">
                {[1, 2, 3, 4].map((s) => (
                  <View key={s} className={`h-1 flex-1 rounded-full ${s <= score ? '' : 'bg-surface-variant'}`} style={s <= score ? { backgroundColor: COLORS[score] } : null} />
                ))}
              </View>
              <Text className="font-label-sm text-label-sm mt-1" style={{ color: COLORS[score] }}>{LABELS[score]}</Text>
            </View>
          ) : null}
          <Input
            label="Confirm new password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            leftIcon="lock"
            error={confirm && confirm !== next ? 'Passwords do not match.' : ''}
          />
          <Button
            label="Update password"
            onPress={() => router.back()}
            fullWidth
            disabled={!current || !next || next !== confirm}
            accessibilityLabel="Update password"
          />
        </ScrollView>
      </Screen>
    </View>
  );
}

function BackIcon() {
  const MaterialIcon = require('../../src/components/ui/MaterialIcon').default;
  return <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />;
}
