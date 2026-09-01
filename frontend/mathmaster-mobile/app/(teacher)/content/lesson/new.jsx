import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import AppBar from '../../../../../src/components/ui/AppBar';
import Button from '../../../../../src/components/ui/Button';
import Input from '../../../../../src/components/ui/Input';
import MaterialIcon from '../../../../../src/components/ui/MaterialIcon';
import { createLesson } from '../../../../src/services/teacher';

export default function CreateLessonScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('20');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createLesson(1, { title, content, duration_minutes: Number(duration) });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background" accessibilityLabel="Create lesson">
      <AppBar title="New Lesson" onBack={() => router.back()} rightIcon="close" onRightIconPress={() => router.back()} />
      <ScrollView contentContainerClassName="px-[24px] pb-32" keyboardShouldPersistTaps="handled">
        <Input label="Lesson title" value={title} onChangeText={setTitle} leftIcon="article" />
        <Input label="Content" value={content} onChangeText={setContent} multiline numberOfLines={8} helperText="Use ## for headings, numbers for steps." />
        <Input label="Duration (minutes)" value={duration} onChangeText={setDuration} keyboardType="number-pad" leftIcon="schedule" />

        <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-3 mt-4">Add to this lesson</Text>
        <View className="flex-row gap-3">
          {[
            { icon: 'quiz', label: 'Quiz' },
            { icon: 'upload_file', label: 'Attachment' },
            { icon: 'functions', label: 'Formula block' },
          ].map((tab) => (
            <View key={tab.label} className="flex-1 bg-surface-container-lowest rounded-2xl p-4 border border-surface-variant/50 items-center">
              <MaterialIcon name={tab.icon} size={22} color="primary" />
              <Text className="font-label-sm text-label-sm text-on-surface mt-2">{tab.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 px-[24px] pb-4 pt-3 bg-background/95 border-t border-surface-container/50 flex-row gap-3">
        <Button variant="secondary" label="Cancel" onPress={() => router.back()} accessibilityLabel="Cancel" />
        <Button label="Save lesson" loading={saving} onPress={save} fullWidth accessibilityLabel="Save lesson" />
      </View>
    </View>
  );
}
