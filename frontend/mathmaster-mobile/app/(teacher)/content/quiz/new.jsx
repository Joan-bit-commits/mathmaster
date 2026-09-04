import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import AppBar from '../../../../src/components/ui/AppBar';
import Button from '../../../../src/components/ui/Button';
import Input from '../../../../src/components/ui/Input';
import { createQuiz } from '../../../../src/services/teacher';

export default function CreateQuizScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createQuiz(1, { title, description });
      router.push('/(teacher)/content/question/new');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background" accessibilityLabel="Create quiz">
      <AppBar title="New Quiz" onBack={() => router.back()} rightIcon="close" onRightIconPress={() => router.back()} />
      <ScrollView contentContainerClassName="px-[24px] pb-32" keyboardShouldPersistTaps="handled">
        <Input label="Quiz title" value={title} onChangeText={setTitle} leftIcon="quiz" />
        <Input label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} helperText="Shown to students before they start." />
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 px-[24px] pb-4 pt-3 bg-background/95 border-t border-surface-container/50">
        <Button label="Save & add questions" loading={saving} onPress={save} fullWidth accessibilityLabel="Save quiz and add questions" />
      </View>
    </View>
  );
}
