import { useQuery } from '@tanstack/react-query';
import * as analytics from '@/services/analytics';

export function usePerformance(period: string = '30d') {
  return useQuery({ queryKey: ['analytics-summary', period], queryFn: () => analytics.getSummary(period) });
}

export function useAnalytics(period: string = '30d') {
  return useQuery({ queryKey: ['analytics', period], queryFn: async () => Promise.all([analytics.getSummary(period), analytics.getWeeklyActivity(), analytics.getScoreTrend(), analytics.getRecentAttempts()]) });
}

export function useTopicPerformance() {
  return useQuery({ queryKey: ['topic-performance'], queryFn: analytics.getTopicPerformance });
}

export function useRecommendations() {
  return useQuery({ queryKey: ['recommendations'], queryFn: analytics.getRecommendations });
}
