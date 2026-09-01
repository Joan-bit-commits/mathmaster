import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import AppBar from '../../../../src/components/ui/AppBar';
import Button from '../../../../src/components/ui/Button';
import Chip from '../../../../src/components/ui/Chip';
import Input from '../../../../src/components/ui/Input';
import MaterialIcon from '../../../../src/components/ui/MaterialIcon';
import { createQuestion } from '../../../../src/services/teacher';

const TYPES = [
  { key: 'mc', label: 'Multiple choice' },
  { key: 'tf', label: 'True / False' },
  { key: 'short', label: 'Short answer' },
];

export default function AddQuestionScreen() {
  const [type, setType] = useState('mc');
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const setChoice = (i, value) => setChoices((c) => c.map((v, ci) => (ci === i ? value : v)));

  const save = async (addAnother) => {
    if (!questionText.trim()) return;
    setSaving(true);
    try {
      const payload =
        type === 'mc'
          ? { question_text: questionText, choices: choices.filter(Boolean), correct_answer: choices[correctIndex] }
          : { question_text: questionText, choices: type === 'tf' ? ['True', 'False'] : [], correct_answer: type === 'tf' ? (correctIndex === 0 ? 'True' : 'False') : correctAnswer };
      await createQuestion(1, payload);
      if (addAnother) {
        setQuestionText('');
        setChoices(['', '', '', '']);
        setCorrectAnswer('');
      } else {
        router.back();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background" accessibilityLabel="Add question">
      <AppBar title="Add Question" onBack={() => router.back()} rightIcon="upload_file" onRightIconPress={() => {}} />
      {/* Step indicator */}
      <View className="flex-row items-center gap-2 px-[24px] pb-3">
        <View className="h-1 flex-1 bg-primary rounded-full" />
        <Text className="font-label-sm text-label-sm text-on-surface-variant">Question 1</Text>
      </View>

      <ScrollView contentContainerClassName="px-[24px] pb-32" keyboardShouldPersistTaps="handled">
        <View className="flex-row gap-2 mb-5">
          {TYPES.map((t) => (
            <Chip key={t.key} label={t.label} selected={type === t.key} onPress={() => setType(t.key)} />
          ))}
        </View>

        <Input label="Question text" value={questionText} onChangeText={setQuestionText} multiline numberOfLines={3} />

        {type === 'mc' ? (
          <>
            <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Choices (tap to mark correct)</Text>
            {choices.map((choice, i) => (
              <View key={i} className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setCorrectIndex(i)}
                  accessibilityRole="radio"
                  accessibilityLabel={`Mark choice ${i + 1} correct`}
                  accessibilityState={{ checked: correctIndex === i }}
                  className={`w-8 h-8 rounded-full border-2 items-center justify-center ${correctIndex === i ? 'border-primary bg-primary' : 'border-outline-variant'}`}
                >
                  {correctIndex === i ? <MaterialIcon name="check" size={14} color="white" /> : <Text className="text-on-surface-variant text-xs">{String.fromCharCode(65 + i)}</Text>}
                </Pressable>
                <View className="flex-1">
                  <Input label={`Choice ${String.fromCharCode(65 + i)}`} value={choice} onChangeText={(v) => setChoice(i, v)} />
                </View>
              </View>
            ))}
          </>
        ) : type === 'tf' ? (
          <View className="flex-row gap-2 mb-4">
            {['True', 'False'].map((v, i) => (
              <Chip key={v} label={v} selected={correctIndex === i} onPress={() => setCorrectIndex(i)} />
            ))}
          </View>
        ) : (
          <Input label="Correct answer" value={correctAnswer} onChangeText={setCorrectAnswer} helperText="Exact match (case-insensitive)." />
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-[24px] pb-4 pt-3 bg-background/95 border-t border-surface-container/50 flex-row gap-3">
        <Button variant="secondary" label="Save & add another" loading={saving} onPress={() => save(true)} accessibilityLabel="Save and add another question" />
        <Button label="Save & finish" onPress={() => save(false)} accessibilityLabel="Save and finish" />
      </View>
    </View>
  );
}
