import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import AppBar from '../../../../src/components/ui/AppBar';
import Button from '../../../../src/components/ui/Button';
import Input from '../../../../src/components/ui/Input';
import LessonPicker from '../../../../src/components/ui/LessonPicker';
import { createQuiz } from '../../../../src/services/teacher';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateQuizScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessonId, setLessonId] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim() || !lessonId) return;
    setSaving(true);
    try {
      // This used to always attach the new quiz to lesson id 1, regardless
      // of which topic/lesson the teacher was actually working on — there
      // was no lesson-selection step at all.
      await createQuiz(lessonId, { title, description });
      router.push('/(teacher)/content/question/new');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Create quiz">
      <AppBar title="New Quiz" onBack={() => router.back()} rightIcon="close" onRightIconPress={() => router.back()} />
      <ScrollView contentContainerClassName="px-[24px] pb-32" keyboardShouldPersistTaps="handled">
        <Input label="Quiz title" value={title} onChangeText={setTitle} leftIcon="quiz" />
        <Input label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} helperText="Shown to students before they start." />
        <Text className="font-title-lg text-on-surface mt-6 mb-3">Attach to lesson</Text>
        <LessonPicker value={lessonId} onChange={setLessonId} />
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 px-[24px] pb-4 pt-3 bg-background/95 border-t border-surface-container/50">
        <Button label="Save & add questions" loading={saving} disabled={!title.trim() || !lessonId} onPress={save} fullWidth accessibilityLabel="Save quiz and add questions" />
      </View>
    </SafeAreaView>
  );
}