import type { AnalyticsSummary, WeeklyActivity, TopicPerformance, ScoreTrend, Recommendation, Attempt } from '@/types/learning';
import { mockAnalyticsSummary, mockWeeklyActivity, mockTopicPerformance, mockScoreTrend, mockRecommendations, mockAttempts } from '@/mocks/analytics';
import { get, post } from '@/lib/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getSummary(period: string = '30d'): Promise<AnalyticsSummary> {
  if (USE_MOCKS) {
    await delay(300);
    return mockAnalyticsSummary;
  }
  return get(`/api/analytics/summary/?period=${period}`);
}

// backend endpoint not implemented yet — using mock/fallback data
export async function getWeeklyActivity(): Promise<WeeklyActivity[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockWeeklyActivity;
  }
  // backend endpoint not implemented yet — using mock/fallback data
  await delay(300);
  return mockWeeklyActivity;
}

export async function getTopicPerformance(): Promise<TopicPerformance[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockTopicPerformance;
  }
  return get('/api/analytics/performance/topics/');
}

// backend endpoint not implemented yet — using mock/fallback data
export async function getScoreTrend(): Promise<ScoreTrend[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockScoreTrend;
  }
  // backend endpoint not implemented yet — using mock/fallback data
  await delay(300);
  return mockScoreTrend;
}

export async function getRecommendations(): Promise<Recommendation[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockRecommendations;
  }
  return get('/api/analytics/recommendations/');
}

// backend endpoint not implemented yet — using mock/fallback data
export async function getRecentAttempts(): Promise<Attempt[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockAttempts;
  }
  // backend endpoint not implemented yet — using mock/fallback data
  await delay(300);
  return mockAttempts;
}

export async function trackEvent(eventType: string, metadata?: Record<string, unknown>): Promise<void> {
  if (USE_MOCKS) return;
  await post('/api/analytics/events/', { event_type: eventType, metadata }).catch(() => {});
}
