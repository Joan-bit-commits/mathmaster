import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as teacher from '@/services/teacher';
import type { Topic, Lesson, Quiz, Question } from '@/types/learning';

// ─── Queries ────────────────────────────────────────────────────

export function useTeacherOverview() {
  return useQuery({ queryKey: ['teacher-overview'], queryFn: teacher.getTeacherOverview });
}

export function useTeacherStudents(filters?: { search?: string; sort?: string; page?: number }) {
  return useQuery({ queryKey: ['teacher-students', filters], queryFn: () => teacher.getTeacherStudents(filters) });
}

export function useTeacherStudent(id?: string) {
  return useQuery({ queryKey: ['teacher-student', id], queryFn: () => teacher.getTeacherStudent(id as string), enabled: Boolean(id) });
}

export function useContentActivity() {
  return useQuery({ queryKey: ['content-activity'], queryFn: teacher.getContentActivity });
}

export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: teacher.getNotifications });
}

export function useSearch(query: string, role: 'student' | 'teacher') {
  return useQuery({ queryKey: ['search', query, role], queryFn: () => teacher.search(query, role), enabled: query.length > 0 });
}

// ─── Topic Mutations ─────────────────────────────────────────────

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Partial<Topic>) => teacher.createTopic(data), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['topics'] }); void qc.invalidateQueries({ queryKey: ['teacher-overview'] }); } });
}

export function useUpdateTopic() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Topic> }) => teacher.updateTopic(id, data), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['topics'] }); void qc.invalidateQueries({ queryKey: ['topic'] }); void qc.invalidateQueries({ queryKey: ['teacher-overview'] }); } });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => teacher.deleteTopic(id), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['topics'] }); void qc.invalidateQueries({ queryKey: ['teacher-overview'] }); } });
}

// ─── Lesson Mutations ────────────────────────────────────────────

export function useCreateLesson() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ topicId, data }: { topicId: string; data: Partial<Lesson> }) => teacher.createLesson(topicId, data), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['lessons'] }); void qc.invalidateQueries({ queryKey: ['teacher-overview'] }); } });
}

export function useUpdateLesson() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Lesson> }) => teacher.updateLesson(id, data), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['lessons'] }); void qc.invalidateQueries({ queryKey: ['lesson'] }); } });
}

export function useDeleteLesson() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => teacher.deleteLesson(id), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['lessons'] }); void qc.invalidateQueries({ queryKey: ['teacher-overview'] }); } });
}

// ─── Quiz Mutations ──────────────────────────────────────────────

export function useCreateQuiz() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ lessonId, data }: { lessonId: string; data: Partial<Quiz> }) => teacher.createQuiz(lessonId, data), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['quizzes'] }); void qc.invalidateQueries({ queryKey: ['teacher-overview'] }); } });
}

export function useUpdateQuiz() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Quiz> }) => teacher.updateQuiz(id, data), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['quizzes'] }); void qc.invalidateQueries({ queryKey: ['quiz'] }); } });
}

export function useDeleteQuiz() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => teacher.deleteQuiz(id), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['quizzes'] }); void qc.invalidateQueries({ queryKey: ['teacher-overview'] }); } });
}

// ─── Question Mutations ──────────────────────────────────────────

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ quizId, data }: { quizId: string; data: Partial<Question> }) => teacher.createQuestion(quizId, data), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['questions'] }); } });
}

export function useBulkCreateQuestions() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ quizId, questions }: { quizId: string; questions: Partial<Question>[] }) => teacher.bulkCreateQuestions(quizId, questions), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['questions'] }); } });
}
