// Teacher authoring service: CRUD for topics/lessons/quizzes/questions.
import { del, patch, post } from './api';
import { USE_MOCK_DATA } from './api';
import { mockCreate } from '../mocks/teacher';

export async function createTopic(payload) {
  if (USE_MOCK_DATA) return mockCreate('topic', payload);
  return post('/api/learning/topics/', payload);
}

export async function updateTopic(id, payload) {
  if (USE_MOCK_DATA) return mockCreate('topic', payload);
  return patch(`/api/learning/topics/${id}/`, payload);
}

export async function deleteTopic(id) {
  if (USE_MOCK_DATA) return { ok: true };
  return del(`/api/learning/topics/${id}/`);
}

export async function createLesson(topicId, payload) {
  if (USE_MOCK_DATA) return mockCreate('lesson', payload);
  return post(`/api/learning/topics/${topicId}/lessons/`, payload);
}

export async function createQuiz(lessonId, payload) {
  if (USE_MOCK_DATA) return mockCreate('quiz', payload);
  return post(`/api/learning/lessons/${lessonId}/quizzes/`, payload);
}

export async function createQuestion(quizId, payload) {
  if (USE_MOCK_DATA) return mockCreate('question', payload);
  return post(`/api/learning/quizzes/${quizId}/questions/`, payload);
}

export async function bulkImportQuestions(quizId, questions) {
  if (USE_MOCK_DATA) return { created: questions.length };
  return post(`/api/learning/quizzes/${quizId}/questions/bulk/`, { questions });
}
