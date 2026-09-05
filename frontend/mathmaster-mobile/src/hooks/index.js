import { useQuery, useQueryClient } from '@tanstack/react-query';

import * as analytics from '../services/analytics';
import * as learning from '../services/learning';

const MIN_SKELETON_MS = 300;
async function withMinSkeleton(promise) {
  const [result] = await Promise.all([promise, new Promise((r) => setTimeout(r, MIN_SKELETON_MS))]);
  return result;
}

// ---- Student learning ----
export const useTopics = (filters) =>
  useQuery({ queryKey: ['topics', filters], queryFn: () => withMinSkeleton(learning.fetchTopics(filters)) });
export const useTopic = (id) =>
  useQuery({ queryKey: ['topic', id], queryFn: () => withMinSkeleton(learning.fetchTopic(id)) });
export const useLessons = (topicId) =>
  useQuery({ queryKey: ['lessons', topicId], queryFn: () => withMinSkeleton(learning.fetchLessons(topicId)) });
export const useLesson = (id) =>
  useQuery({ queryKey: ['lesson', id], queryFn: () => withMinSkeleton(learning.fetchLesson(id)) });
export const useQuizzes = (lessonId) =>
  useQuery({ queryKey: ['quizzes', lessonId], queryFn: () => withMinSkeleton(learning.fetchQuizzes(lessonId)) });
export const useQuiz = (id) =>
  useQuery({ queryKey: ['quiz', id], queryFn: () => withMinSkeleton(learning.fetchQuiz(id)) });
export const useQuestions = (quizId) =>
  useQuery({ queryKey: ['questions', quizId], queryFn: () => withMinSkeleton(learning.fetchQuestions(quizId)) });

// ---- Analytics ----
export const usePerformance = (period) =>
  useQuery({ queryKey: ['summary', period], queryFn: () => withMinSkeleton(analytics.fetchSummary(period)) });
export const useAnalytics = usePerformance;
export const useTopicPerformance = () =>
  useQuery({ queryKey: ['topicPerformance'], queryFn: () => withMinSkeleton(analytics.fetchTopicPerformance()) });
export const useRecommendations = () =>
  useQuery({ queryKey: ['recommendations'], queryFn: () => withMinSkeleton(analytics.fetchRecommendations()) });
export const useTeacherOverview = () =>
  useQuery({ queryKey: ['teacherOverview'], queryFn: () => withMinSkeleton(analytics.fetchTeacherOverview()) });
export const useTeacherStudents = () =>
  useQuery({ queryKey: ['teacherStudents'], queryFn: () => withMinSkeleton(analytics.fetchTeacherStudents()) });

export * from './useTabBarSpacing';

// ---- Mutations ----
export function useSubmitAttempt(quizId) {
  const qc = useQueryClient();
  return useMutationWithInvalidate(
    (answers) => learning.submitAttempt(quizId, answers),
    [['attempts'], ['summary']]
  );
}

// Small wrapper so we don't import useMutation everywhere with the same options.
import { useMutation } from '@tanstack/react-query';
function useMutationWithInvalidate(fn, keys) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}
