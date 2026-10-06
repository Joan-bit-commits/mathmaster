import type { Topic, Lesson, Quiz, Question, Attempt } from '@/types/learning';
import { mockTopics } from '@/mocks/topics';
import { mockLessons } from '@/mocks/lessons';
import { mockQuizzes, mockQuestions } from '@/mocks/quizzes';
import { mockAttempts } from '@/mocks/analytics';
import { get, post } from '@/lib/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getTopics(filters?: { level?: string; search?: string; page?: number }): Promise<{ results: Topic[]; hasMore: boolean }> {
  if (USE_MOCKS) {
    await delay(400);
    let results = [...mockTopics];
    if (filters?.level && filters.level !== 'All') {
      results = results.filter((t) => t.level === filters.level);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    const page = filters?.page ?? 1;
    const perPage = 6;
    const start = (page - 1) * perPage;
    const pageResults = results.slice(start, start + perPage);
    return { results: pageResults, hasMore: start + perPage < results.length };
  }
  const params = new URLSearchParams();
  if (filters?.level) params.set('level', filters.level);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.page) params.set('page', String(filters.page));
  return get(`/api/learning/topics/?${params}`);
}

export async function getTopic(id: string): Promise<Topic> {
  if (USE_MOCKS) {
    await delay(300);
    const topic = mockTopics.find((t) => t.id === id);
    if (!topic) throw new Error('Topic not found');
    return topic;
  }
  return get(`/api/learning/topics/${id}/`);
}

export async function getLessonsByTopic(topicId: string): Promise<Lesson[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockLessons.filter((l) => l.topic_id === topicId).sort((a, b) => a.order - b.order);
  }
  return get(`/api/learning/topics/${topicId}/lessons/`);
}

export async function getLesson(id: string): Promise<Lesson> {
  if (USE_MOCKS) {
    await delay(300);
    const lesson = mockLessons.find((l) => l.id === id);
    if (!lesson) throw new Error('Lesson not found');
    return lesson;
  }
  return get(`/api/learning/lessons/${id}/`);
}

export async function getQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockQuizzes.filter((q) => q.lesson_id === lessonId);
  }
  return get(`/api/learning/lessons/${lessonId}/quizzes/`);
}

export async function getQuiz(id: string): Promise<Quiz> {
  if (USE_MOCKS) {
    await delay(300);
    const quiz = mockQuizzes.find((q) => q.id === id);
    if (!quiz) throw new Error('Quiz not found');
    return quiz;
  }
  return get(`/api/learning/quizzes/${id}/`);
}

export async function getQuestions(quizId: string): Promise<Question[]> {
  if (USE_MOCKS) {
    await delay(400);
    return mockQuestions.filter((q) => q.quiz_id === quizId).sort((a, b) => a.order - b.order);
  }
  return get(`/api/learning/quizzes/${quizId}/questions/`);
}

export async function submitAttempt(quizId: string, answers: Record<string, string>): Promise<Attempt> {
  if (USE_MOCKS) {
    await delay(600);
    const questions = mockQuestions.filter((q) => q.quiz_id === quizId);
    const attemptAnswers = questions.map((q) => ({
      question_id: q.id,
      question_text: q.text,
      user_answer: answers[q.id] ?? '',
      correct_answer: q.correct_answer,
      is_correct: (answers[q.id] ?? '').trim().toLowerCase() === q.correct_answer.trim().toLowerCase(),
      explanation: q.explanation,
    }));
    const score = attemptAnswers.filter((a) => a.is_correct).length;
    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const quiz = mockQuizzes.find((q) => q.id === quizId);
    return {
      id: `attempt-${Date.now()}`,
      quiz_id: quizId,
      quiz_title: quiz?.title ?? 'Quiz',
      score,
      total,
      percentage,
      xp_earned: percentage,
      answers: attemptAnswers,
      created_at: new Date().toISOString(),
    };
  }
  return post(`/api/learning/quizzes/${quizId}/attempts/`, { answers });
}

// backend endpoint not implemented yet — using mock/fallback data
export async function getAttempt(quizId: string, attemptId: string): Promise<Attempt> {
  if (USE_MOCKS) {
    await delay(300);
    const attempt = mockAttempts.find((a) => a.id === attemptId);
    if (attempt) return attempt;
    const quiz = mockQuizzes.find((q) => q.id === quizId);
    return {
      id: attemptId,
      quiz_id: quizId,
      quiz_title: quiz?.title ?? 'Quiz',
      score: 4,
      total: 5,
      percentage: 80,
      xp_earned: 80,
      answers: [],
      created_at: new Date().toISOString(),
    };
  }
  // backend endpoint not implemented yet — using mock/fallback data
  await delay(300);
  const quiz = mockQuizzes.find((q) => q.id === quizId);
  return {
    id: attemptId,
    quiz_id: quizId,
    quiz_title: quiz?.title ?? 'Quiz',
    score: 4,
    total: 5,
    percentage: 80,
    xp_earned: 80,
    answers: [],
    created_at: new Date().toISOString(),
  };
}
