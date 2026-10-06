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
  // The API returns current_streak_days / average_score — map to the shape the UI uses.
  const raw = await get<Record<string, any>>(`/api/analytics/summary/?period=${period}`);
  return {
    lessons_completed: raw.lessons_completed ?? 0,
    quizzes_taken: raw.quizzes_taken ?? 0,
    avg_score: raw.avg_score ?? raw.average_score ?? null,
    current_streak: raw.current_streak ?? raw.current_streak_days ?? 0,
    topics_covered: raw.topics_covered,
    ai_questions_asked: raw.ai_questions_asked,
    longest_streak: raw.longest_streak,
    total_xp: raw.total_xp,
    level: raw.level,
    mastery: raw.mastery,
  };
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
  const data = await get<any>('/api/analytics/recommendations/');
  const list: any[] = Array.isArray(data) ? data : data?.results ?? [];
  return list.map((r) => ({
    topic_id: String(r.topic_id ?? r.topic ?? ''),
    topic_name: r.topic_name ?? '',
    reason: r.reason ?? r.recommendation_text ?? '',
  }));
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