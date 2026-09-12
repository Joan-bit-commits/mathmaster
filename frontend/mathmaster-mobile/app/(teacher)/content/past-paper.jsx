import { router } from 'expo-router';
import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppBar from '../../../src/components/ui/AppBar';
import Button from '../../../src/components/ui/Button';
import ErrorState from '../../../src/components/ui/ErrorState';
import LessonPicker from '../../../src/components/ui/LessonPicker';
import LoadingSkeleton from '../../../src/components/ui/LoadingSkeleton';
import MaterialIcon from '../../../src/components/ui/MaterialIcon';
import {
  extractPastPaperQuestions,
  pollPastPaperUntilProcessed,
  savePastPaperAsQuiz,
  uploadPastPaper,
} from '../../../src/services/curriculum';

export default function PastPaperScreen() {
  const [file, setFile] = useState(null);
  const [document, setDocument] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [excluded, setExcluded] = useState(() => new Set());
  const [lessonId, setLessonId] = useState(null);
  const [saved, setSaved] = useState(null);

  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled) {
      setFile(result.assets[0]);
      setDocument(null);
      setQuestions([]);
      setExcluded(new Set());
      setError(null);
      setSaved(null);
    }
  };

  const generate = async () => {
    if (!file) return;
    setGenerating(true);
    setError(null);
    try {
      let uploaded = await uploadPastPaper(file, { title: file.name });
      // Processing may now run in the background (see the backend's
      // CELERY_TASK_ALWAYS_EAGER setting) — this resolves immediately
      // when it's still running synchronously, so it's safe either way.
      if (uploaded.processing_status === 'pending' || uploaded.processing_status === 'processing') {
        uploaded = await pollPastPaperUntilProcessed(uploaded.id);
      }
      setDocument(uploaded);
      if (uploaded.processing_status === 'failed') {
        setError(uploaded.processing_error || "Couldn't read this PDF.");
        return;
      }
      if (uploaded.processing_status !== 'ready') {
        setError('Still processing this paper — try generating again in a moment.');
        return;
      }
      const result = await extractPastPaperQuestions(uploaded.id);
      setQuestions(result.questions || []);
      if (!result.questions?.length) {
        setError("Couldn't find any questions in this paper — try a clearer scan or a different file.");
      }
    } catch (e) {
      setError(e?.message || 'Something went wrong generating the quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleQuestion = (index) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => setExcluded(new Set());
  const selectNone = () => setExcluded(new Set(questions.map((_, i) => i)));

  const includedQuestions = questions.filter((_, i) => !excluded.has(i));

  const save = async () => {
    if (!document || !lessonId || includedQuestions.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const result = await savePastPaperAsQuiz(document.id, {
        lessonId,
        questions: includedQuestions,
        title: file?.name,
      });
      setSaved(result);
    } catch (e) {
      setError(e?.message || "Couldn't save this quiz.");
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Quiz saved">
        <AppBar title="Past paper → Quiz" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-8">
          <MaterialIcon name="check_circle" size={48} color="primary" />
          <Text className="font-title-lg text-on-surface mt-4 text-center">
            Saved {saved.question_count} question{saved.question_count === 1 ? '' : 's'} as a new quiz
          </Text>
          <Button
            className="mt-6"
            label="Done"
            onPress={() => router.replace('/(teacher)/(tabs)/content')}
            accessibilityLabel="Back to content"
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View className="px-6 pt-4">
      <Text className="font-body-md text-on-surface-variant">
        Upload a UNEB paper and turn its questions into a practice quiz.
      </Text>

      <Pressable
        onPress={pick}
        className="mt-6 items-center rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-lowest p-10"
        accessibilityRole="button"
        accessibilityLabel="Choose past paper PDF"
      >
        <Text className="font-title-lg text-primary">{file?.name || 'Choose past paper PDF'}</Text>
        <Text className="font-body-sm mt-2 text-on-surface-variant">Teacher and admin access only</Text>
      </Pressable>

      <Button
        className="mt-6"
        label="Generate quiz"
        fullWidth
        disabled={!file}
        loading={generating}
        onPress={generate}
        accessibilityLabel="Generate quiz from this paper"
      />

      {error && <ErrorState className="mt-6" description={error} onRetry={file ? generate : undefined} />}

      {generating && (
        <View className="mt-8 gap-3">
          {[...Array(3)].map((_, i) => <LoadingSkeleton key={i} variant="card" className="h-16" />)}
        </View>
      )}

      {questions.length > 0 && (
        <View className="mt-8 flex-row items-center justify-between">
          <Text className="font-title-lg text-on-surface">
            Extracted questions ({includedQuestions.length} of {questions.length} selected)
          </Text>
          <View className="flex-row gap-4">
            <Pressable onPress={selectAll} accessibilityRole="button" accessibilityLabel="Select all questions">
              <Text className="font-label-sm text-primary">Select all</Text>
            </Pressable>
            <Pressable onPress={selectNone} accessibilityRole="button" accessibilityLabel="Deselect all questions">
              <Text className="font-label-sm text-primary">Select none</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (questions.length === 0) return null;
    return (
      <View className="px-6 pb-8">
        <Text className="font-title-lg text-on-surface mt-4">Attach to lesson</Text>
        <LessonPicker value={lessonId} onChange={setLessonId} />

        <Button
          className="mt-2"
          label="Save as quiz"
          fullWidth
          disabled={!lessonId || includedQuestions.length === 0}
          loading={saving}
          onPress={save}
          accessibilityLabel="Save selected questions as a quiz"
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Past paper to quiz generator">
      <AppBar title="Past paper → Quiz" onBack={() => router.back()} />
      <FlatList
        data={questions}
        keyExtractor={(_, index) => String(index)}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => {
          const isExcluded = excluded.has(index);
          return (
            <View className="px-6">
              <Pressable
                onPress={() => toggleQuestion(index)}
                className={`mt-3 rounded-2xl p-4 ${isExcluded ? 'bg-surface-container opacity-50' : 'bg-surface-container-lowest'}`}
                accessibilityRole="button"
                accessibilityLabel={`${isExcluded ? 'Include' : 'Exclude'} question: ${item.question}`}
              >
                <Text className="font-body-md text-on-surface">{item.question}</Text>
                <Text className="font-label-sm mt-2 text-primary">
                  {item.marks} mark{item.marks === 1 ? '' : 's'} · {item.type === 'multiple-choice' ? 'Multiple choice' : 'Short answer'}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}





