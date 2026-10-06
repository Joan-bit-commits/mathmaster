import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare, Trophy, RotateCcw, Target, ClipboardCheck, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { useTeacherStudent } from '@/hooks/useTeacher';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { formatRelativeTime } from '@/lib/utils';

const scoreColor = (s: number) => s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : '#F43F5E';

export default function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const studentQuery = useTeacherStudent(studentId);
  const s = studentQuery.data;

  if (studentQuery.isLoading) return <AppShell><div className="mx-auto max-w-3xl"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (studentQuery.isError || !s) return <AppShell><ErrorState onRetry={() => void studentQuery.refetch()} message="Could not load this student." /></AppShell>;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <Breadcrumb items={[{ label: 'Students', href: '/teacher/students' }, { label: s.first_name }]} />

        {/* Hero */}
        <Card className="overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 text-2xl"><AvatarFallback className="text-2xl">{s.first_name[0]}</AvatarFallback></Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-ink-900 dark:text-white">{s.first_name}</h1>
              <p className="mt-1 text-sm text-ink-500">{s.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge tone="brand">{s.level}</Badge>
                <Badge tone="neutral">@{s.username}</Badge>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => toast.success('Message sent!')}><MessageSquare className="h-4 w-4" /> Message</Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat title="Total attempts" value={s.total_attempts} icon={ClipboardCheck} />
          <Stat title="Avg score" value={`${s.avg_score}%`} icon={Target} />
          <Stat title="Lessons done" value={s.lessons_completed} icon={Activity} />
          <Stat title="Last active" value={formatRelativeTime(s.last_active)} icon={Activity} />
        </div>

        {/* Score chart */}
        <Card className="mt-6 p-5">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Score over time</h3>
          <p className="mt-0.5 text-xs text-ink-400">Last 30 days</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={s.score_trend}>
                <defs><linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.3} /><stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#0EA5E9" strokeWidth={2} dot={{ r: 3, fill: '#0EA5E9' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Topic mastery */}
        <Card className="mt-6 p-5">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Topic mastery</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.topic_mastery} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic_name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={120} />
                <RTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>{s.topic_mastery.map((t) => <Cell key={t.topic_id} fill={scoreColor(t.score)} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent attempts */}
        <div className="mt-6">
          <h3 className="mb-4 text-lg font-semibold text-ink-900 dark:text-ink-100">Last attempts</h3>
          <div className="space-y-3">
            {s.recent_attempts.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: scoreColor(a.percentage) + '20', color: scoreColor(a.percentage) }}><Trophy className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{a.quiz_title}</p>
                    <p className="text-xs text-ink-400">{formatRelativeTime(a.created_at)} · {a.score}/{a.total} correct</p>
                  </div>
                  <Badge tone={a.percentage >= 75 ? 'success' : a.percentage >= 50 ? 'brand' : 'warning'}>{a.percentage}%</Badge>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/quizzes/${a.quiz_id}`)}><RotateCcw className="h-4 w-4" /></Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <Card className="mt-6 bg-indigo-50 p-5 dark:bg-indigo-900/10">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Recommendations</h3>
          <div className="mt-3 space-y-2">
            {s.recommendations.map((r) => (
              <div key={r.topic_id} className="rounded-xl bg-white/60 p-3 dark:bg-ink-800/60">
                <p className="text-sm font-medium text-ink-800 dark:text-ink-200">{r.topic_name}</p>
                <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{r.reason}</p>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => toast.success('Message sent!')}><Mail className="h-4 w-4" /> Send encouragement</Button>
        </Card>

        <div className="mt-6"><Button variant="ghost" onClick={() => navigate('/teacher/students')}><ArrowLeft className="h-4 w-4" /> Back to students</Button></div>
      </div>
    </AppShell>
  );
}
