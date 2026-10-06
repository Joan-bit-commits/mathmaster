import { useMutation, useQuery } from '@tanstack/react-query';
import * as learning from '@/services/learning';

export function useTopics(filters?: { level?: string; search?: string; page?: number }) {
  return useQuery({ queryKey: ['topics', filters], queryFn: () => learning.getTopics(filters) });
}

export function useTopic(id?: string) {
  return useQuery({ queryKey: ['topic', id], queryFn: () => learning.getTopic(id as string), enabled: Boolean(id) });
}

export function useLessons(topicId?: string) {
  return useQuery({ queryKey: ['lessons', topicId], queryFn: () => learning.getLessonsByTopic(topicId as string), enabled: Boolean(topicId) });
}

export function useLesson(id?: string) {
  return useQuery({ queryKey: ['lesson', id], queryFn: () => learning.getLesson(id as string), enabled: Boolean(id) });
}

export function useQuizzes(lessonId?: string) {
  return useQuery({ queryKey: ['quizzes', lessonId], queryFn: () => learning.getQuizzesByLesson(lessonId as string), enabled: Boolean(lessonId) });
}

export function useQuiz(id?: string) {
  return useQuery({ queryKey: ['quiz', id], queryFn: () => learning.getQuiz(id as string), enabled: Boolean(id) });
}

export function useQuestions(quizId?: string) {
  return useQuery({ queryKey: ['questions', quizId], queryFn: () => learning.getQuestions(quizId as string), enabled: Boolean(quizId) });
}

export function useAttempt(quizId?: string, attemptId?: string) {
  return useQuery({ queryKey: ['attempt', quizId, attemptId], queryFn: () => learning.getAttempt(quizId as string, attemptId as string), enabled: Boolean(quizId && attemptId) });
}

export function useSubmitAttempt() {
  return useMutation({ mutationFn: ({ quizId, answers }: { quizId: string; answers: Record<string, string> }) => learning.submitAttempt(quizId, answers) });
}
