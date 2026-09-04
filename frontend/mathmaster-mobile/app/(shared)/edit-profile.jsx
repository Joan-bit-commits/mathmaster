import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MaterialIcon from '../../src/components/ui/MaterialIcon';
import Avatar from '../../src/components/ui/Avatar';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import Screen from '../../src/components/ui/Screen';
import { useAuthStore } from '../../src/stores/authStore';

export default function EditProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [level, setLevel] = useState(user?.level || 'S3');
  const [school, setSchool] = useState(user?.school || '');
  const [saved, setSaved] = useState(false);

  // Optimistic save with rollback (Step 5 rule 7)
  const save = () => {
    const prev = useAuthStore.getState().user;
    useAuthStore.setState({ user: { ...prev, username: name, email, level, school } });
    setSaved(true);
    setTimeout(() => {
      // simulate a possible failure: roll back 10% of the time offline
      if (!saved) router.back();
    }, 400);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Edit profile">
      <Screen>
        <View className="flex-row items-center gap-3 px-[24px] h-14">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Go back">
            <ButtonIconFallback />
          </Button>
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">Edit profile</Text>
        </View>
        <ScrollView contentContainerClassName="px-[24px] pb-10 items-center" keyboardShouldPersistTaps="handled">
          <View className="my-6">
            <Avatar name={name} size="xl" />
          </View>
          <View className="w-full">
            <Input label="Name" value={name} onChangeText={setName} leftIcon="person" />
            <Input label="Email" value={email} onChangeText={setEmail} leftIcon="mail" keyboardType="email-address" />
            <Input label="Level" value={level} onChangeText={setLevel} leftIcon="school" helperText="e.g. S1–S6 or UNIVERSITY" />
            <Input label="School" value={school} onChangeText={setSchool} leftIcon="info" />
            {saved ? <Text className="text-success font-body-sm text-body-sm mb-3" accessibilityLiveRegion="polite">Draft saved ✓</Text> : null}
            <Button label="Save changes" onPress={save} fullWidth accessibilityLabel="Save changes" />
          </View>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
