import * as React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ClipboardCheck, Flame, Target, Trophy, RotateCcw } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, RadialBar, RadialBarChart, PolarAngleAxis, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { usePerformance, useAnalytics, useTopicPerformance } from '@/hooks/useAnalytics';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatRelativeTime } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const scoreColor = (score: number) => score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#F43F5E';

export default function Performance() {
  const [period, setPeriod] = React.useState('30d');
  const summaryQuery = usePerformance(period);
  const analyticsQuery = useAnalytics(period);
  const topicPerfQuery = useTopicPerformance();
  const navigate = useNavigate();

  const summary = summaryQuery.data;
  const [, weekly, scoreTrend, recentAttempts] = analyticsQuery.data ?? [null, [], [], []];
  const topicPerf = topicPerfQuery.data ?? [];

  if (summaryQuery.isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (summaryQuery.isError) return <AppShell><ErrorState onRetry={() => void summaryQuery.refetch()} message="Could not load your performance data." /></AppShell>;

  const masteryData = [{ name: 'Mastery', value: summary?.mastery ?? 62, fill: '#0EA5E9' }];

  return (
    <AppShell>
      <PageHeader title="Your progress" description="Track your growth and celebrate every win." />
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Mastery ring */}
        <Card className="flex items-center gap-6 rounded-[2rem] p-6 lg:flex-1">
          <div className="h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart data={masteryData} innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={90 - 360}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={20} fill="#0EA5E9" background={{ fill: '#E2E8F0' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-4xl font-bold text-ink-900 dark:text-white">{summary?.mastery ?? 62}%</p>
            <p className="mt-1 text-sm text-ink-500">Overall mastery</p>
            <p className="mt-3 text-xs text-ink-400">Level {summary?.level ?? 4} · {summary?.total_xp ?? 2400} XP</p>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid flex-[2] grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat title="Lessons" value={summary?.lessons_completed ?? 12} icon={ClipboardCheck} />
          <Stat title="Quizzes" value={summary?.quizzes_taken ?? 8} icon={BarChart3} />
          <Stat title="Avg score" value={`${summary?.avg_score ?? 78}%`} icon={Target} />
          <Stat title="Streak" value={`${summary?.current_streak ?? 5}d`} icon={Flame} trend={{ value: `Best: ${summary?.longest_streak ?? 12}d`, direction: 'up' }} />
        </div>
      </div>

      {/* Period tabs */}
      <div className="mt-6">
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="all">All time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Weekly activity</h3>
          <p className="mt-0.5 text-xs text-ink-400">Lessons and quizzes per week</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Bar dataKey="lessons" fill="#0EA5E9" radius={[4, 4, 0, 0]} name="Lessons" />
                <Bar dataKey="quizzes" fill="#6366F1" radius={[4, 4, 0, 0]} name="Quizzes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Score trend</h3>
          <p className="mt-0.5 text-xs text-ink-400">Your quiz scores over time</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrend}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#0EA5E9" strokeWidth={2} dot={{ r: 3, fill: '#0EA5E9' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Topic mastery */}
      <Card className="mt-6 p-5">
        <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Topic mastery</h3>
        <p className="mt-0.5 text-xs text-ink-400">Performance across all topics</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicPerf} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="topic_name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={120} />
              <RTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {topicPerf.map((entry) => <Cell key={entry.topic_id} fill={scoreColor(entry.score)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent attempts */}
      <div className="mt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink-900 dark:text-ink-100">Recent attempts</h3>
        <div className="space-y-3">
          {recentAttempts.slice(0, 5).map((attempt, i) => (
            <motion.div key={attempt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: scoreColor(attempt.percentage) + '20', color: scoreColor(attempt.percentage) }}>
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{attempt.quiz_title}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{formatRelativeTime(attempt.created_at)} · {attempt.score}/{attempt.total} correct</p>
                </div>
                <Badge tone={attempt.percentage >= 75 ? 'success' : attempt.percentage >= 50 ? 'brand' : 'warning'}>{attempt.percentage}%</Badge>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/quizzes/${attempt.quiz_id}`)}><RotateCcw className="h-4 w-4" /></Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
