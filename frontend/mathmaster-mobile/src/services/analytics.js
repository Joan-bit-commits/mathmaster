// Analytics service (student + teacher).
import { get } from './api';
import { USE_MOCK_DATA } from './api';
import { mockRecommendations, mockStudentSummary, mockTeacherOverview, mockTeacherStudents, mockTopicPerformance } from '../mocks/analytics';

export async function fetchSummary(period = 'all') {
  if (USE_MOCK_DATA) return mockStudentSummary(period);
  return get(`/api/analytics/summary/?period=${period}`);
}

export async function fetchTopicPerformance() {
  if (USE_MOCK_DATA) return mockTopicPerformance;
  return get('/api/analytics/performance/topics/');
}

export async function fetchRecommendations() {
  if (USE_MOCK_DATA) return mockRecommendations;
  return get('/api/analytics/recommendations/');
}

export async function fetchTeacherOverview() {
  if (USE_MOCK_DATA) return mockTeacherOverview;
  return get('/api/analytics/teacher/overview/');
}

export async function fetchTeacherStudents() {
  if (USE_MOCK_DATA) return mockTeacherStudents;
  return get('/api/analytics/teacher/students/');
}
