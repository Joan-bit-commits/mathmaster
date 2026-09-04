// Learning service: topics, lessons, quizzes, questions, attempts.
import { get, post } from './api';
import { USE_MOCK_DATA } from './api';
import { mockAttempt, mockLesson, mockLessons, mockQuestions, mockQuiz, mockQuizzes, mockTopic, mockTopics } from '../mocks/learning';

export async function fetchTopics({ level, subject } = {}) {
  if (USE_MOCK_DATA) return mockTopics({ level, subject });
  const params = new URLSearchParams();
  if (level) params.set('level', level);
  if (subject) params.set('subject', subject);
  const qs = params.toString();
  const data = await get(`/api/learning/topics/${qs ? `?${qs}` : ''}`);
  return data.results ?? data;
}

export async function fetchTopic(id) {
  if (USE_MOCK_DATA) return mockTopic(id);
  return get(`/api/learning/topics/${id}/`);
}

export async function fetchLessons(topicId) {
  if (USE_MOCK_DATA) return mockLessons(topicId);
  const data = await get(`/api/learning/topics/${topicId}/lessons/`);
  return data.results ?? data;
}

export async function fetchLesson(id) {
  if (USE_MOCK_DATA) return mockLesson(id);
  return get(`/api/learning/lessons/${id}/`);
}

export async function fetchQuizzes(lessonId) {
  if (USE_MOCK_DATA) return mockQuizzes(lessonId);
  const data = await get(`/api/learning/lessons/${lessonId}/quizzes/`);
  return data.results ?? data;
}

export async function fetchQuiz(id) {
  if (USE_MOCK_DATA) return mockQuiz(id);
  return get(`/api/learning/quizzes/${id}/`);
}

export async function fetchQuestions(quizId) {
  if (USE_MOCK_DATA) return mockQuestions(quizId);
  const data = await get(`/api/learning/quizzes/${quizId}/questions/`);
  return data.results ?? data;
}

export async function submitAttempt(quizId, answers) {
  if (USE_MOCK_DATA) return mockAttempt(quizId, answers);
  return post(`/api/learning/quizzes/${quizId}/attempts/`, { answers });
}
