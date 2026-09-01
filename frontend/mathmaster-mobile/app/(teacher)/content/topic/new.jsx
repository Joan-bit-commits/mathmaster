import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import AppBar from '../../../../src/components/ui/AppBar';
import Button from '../../../../src/components/ui/Button';
import Chip from '../../../../src/components/ui/Chip';
import Input from '../../../../src/components/ui/Input';
import { createTopic } from '../../../../src/services/teacher';

const LEVELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'UNIVERSITY'];
const DRAFT_KEY = 'draft-topic';

/** Auto-saves draft to AsyncStorage every 5s (Step 5 rule 8). */
function useDraftAutosave(draft, key = DRAFT_KEY) {
  useEffect(() => {
    const timer = setInterval(() => {
      if (draft && Object.values(draft).some(Boolean)) {
        import('@react-native-async-storage/async-storage').then((Storage) =>
          Storage.default.setItem(key, JSON.stringify(draft))
        );
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [draft, key]);
}

export default function CreateTopicScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('S1');
  const [subject, setSubject] = useState('Mathematics');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useDraftAutosave({ name, description, level, subject });

  const save = async (andLesson) => {
    if (!name.trim()) {
      setError('Give the topic a name.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createTopic({ name, description, level, subject });
      import('expo-haptics').then((H) => H.notificationAsync(H.NotificationFeedbackType.Success)).catch(() => {});
      if (andLesson) {
        router.replace('/(teacher)/content/lesson/new');
      } else {
        router.back();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background" accessibilityLabel="Create topic">
      <AppBar title="New Topic" onBack={() => router.back()} rightIcon="close" onRightIconPress={() => router.back()} />
      <ScrollView contentContainerClassName="px-[24px] pb-32" keyboardShouldPersistTaps="handled">
        <Input label="Topic name" value={name} onChangeText={setName} leftIcon="menu_book" error={error} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} helperText="What will students learn?" />
        <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2 mt-2">Level</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {LEVELS.map((l) => <Chip key={l} label={l} selected={level === l} onPress={() => setLevel(l)} />)}
        </View>
        <Input label="Subject" value={subject} onChangeText={setSubject} leftIcon="school" />
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 px-[24px] pb-4 pt-3 bg-background/95 border-t border-surface-container/50 flex-row gap-3">
        <Button variant="secondary" label="Cancel" onPress={() => router.back()} accessibilityLabel="Cancel" />
        <Button label="Save" loading={saving} onPress={() => save(false)} accessibilityLabel="Save topic" />
        <Button variant="gradient" label="Save & add lesson" onPress={() => save(true)} accessibilityLabel="Save and add lesson" />
      </View>
    </View>
  );
}
