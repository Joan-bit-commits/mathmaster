import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useLessons, useTopics } from '../../hooks';
import Chip from './Chip';
import LoadingSkeleton from './LoadingSkeleton';

/**
 * Two-step topic -> lesson picker. Used anywhere a teacher needs to attach
 * something (a quiz, a generated quiz from a past paper) to a specific
 * lesson — previously that attachment point was just hardcoded to lesson
 * id 1 wherever this was needed, regardless of what the teacher was
 * actually working on.
 */
export default function LessonPicker({ value, onChange }) {
  const { data: topics, isLoading: topicsLoading } = useTopics();
  const [topicId, setTopicId] = useState(null);
  const { data: lessons, isLoading: lessonsLoading } = useLessons(topicId);

  return (
    <View>
      <Text className="font-label-sm text-label-sm text-on-surface-variant mb-2">Topic</Text>
      {topicsLoading ? (
        <LoadingSkeleton variant="text" className="w-40 h-8" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-1">
          {(topics || []).map((t) => (
            <Chip
              key={t.id}
              label={t.name}
              selected={topicId === t.id}
              onPress={() => {
                setTopicId(t.id);
                onChange(null);
              }}
            />
          ))}
        </ScrollView>
      )}

      {topicId && (
        <>
          <Text className="font-label-sm text-label-sm text-on-surface-variant mb-2 mt-4">Lesson</Text>
          {lessonsLoading ? (
            <LoadingSkeleton variant="text" className="w-40 h-8" />
          ) : (lessons || []).length === 0 ? (
            <Text className="font-body-sm text-body-sm text-on-surface-variant">No lessons in this topic yet.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-1">
              {lessons.map((l) => (
                <Chip key={l.id} label={l.title} selected={value === l.id} onPress={() => onChange(l.id)} />
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}