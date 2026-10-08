import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardCheck, GraduationCap, Library, Plus, AlertTriangle, ArrowRight, CheckCircle2, PencilLine, ScanLine } from 'lucide-react';
import { useTeacherOverview } from '@/hooks/useTeacher';
import { useTopics } from '@/hooks/useLearning';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/shared/Section';
import { ActionTile } from '@/components/ui/action-tile';
import { LoadingSkeleton, TopicsGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuthStore } from '@/stores/authStore';

// PageHeader intentionally not used — dashboard has custom hero

export default function TeacherDashboard() {
  const user = useAuthStore((s) => s.user);
  const overviewQuery = useTeacherOverview();
  const topicsQuery = useTopics({ page: 1 });
  const ov = overviewQuery.data;
  const topics = topicsQuery.data?.results ?? [];

  const contentGaps = topics.filter((t) => t.lessons_count === 0 || t.quizzes_count === 0);
  const featuredTopic = topics[0];
  // Share of topics that have at least one lesson and one quiz.
  const coveragePct = topics.length ? Math.round(((topics.length - contentGaps.length) / topics.length) * 100) : 0;

  if (overviewQuery.isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div><div className="mt-6"><TopicsGridSkeleton /></div></AppShell>;
  if (overviewQuery.isError) return <AppShell><ErrorState onRetry={() => void overviewQuery.refetch()} message="Could not load your dashboard." /></AppShell>;

  return (
    <AppShell>
      {/* Hero */}
      <div className="overflow-hidden rounded-[2rem] bg-ink-900 p-6 sm:p-8">
        <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Welcome, {user?.first_name ?? 'Teacher'}</p>
        <p className="mt-2 text-base text-ink-300">Build and track your MathMaster curriculum</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-xs font-medium text-ink-400">Topics fully covered</p>
            <p className="mt-1 text-2xl font-bold text-brand-300">{coveragePct}%</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-xs font-medium text-ink-400">Active students</p>
            <p className="mt-1 text-2xl font-bold text-white">{ov?.active_students_7d}</p>
            <p className="mt-0.5 text-xs text-ink-400">last 7 days</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat title="Topics" value={ov?.topics_count ?? 0} icon={Library} />
        <Stat title="Lessons" value={ov?.lessons_count ?? 0} icon={BookOpen} />
        <Stat title="Quizzes" value={ov?.quizzes_count ?? 0} icon={ClipboardCheck} />
        <Stat title="Students" value={ov?.students_count ?? 0} icon={GraduationCap} trend={{ value: `+${ov?.new_students_this_week ?? 0} this week`, direction: 'up' }} />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ActionTile icon={Plus} title="Add topic" description="Create a new topic" to="/teacher/content/topics/new" />
        <ActionTile icon={Plus} title="Add lesson" description="Write a new lesson" to="/teacher/content/lessons/new" />
        <ActionTile icon={Plus} title="Add quiz" description="Create a quiz" to="/teacher/content/quizzes/new" />
        <ActionTile icon={ScanLine} title="Past paper to quiz" description="Turn a paper into questions" to="/teacher/past-paper" />
      </div>

      {/* Curriculum map + Featured */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Section title="Curriculum map" action={{ label: 'View all', href: '/teacher/curriculum' }}>
          <div className="space-y-3">
            {topics.slice(0, 5).map((topic, i) => (
              <motion.div key={topic.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/teacher/curriculum/${topic.id}`}>
                  <Card hover className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">{topic.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">{topic.description}</p>
                        <div className="mt-2 flex gap-2">
                          <Badge tone="neutral">{topic.lessons_count} lessons</Badge>
                          <Badge tone="neutral">{topic.quizzes_count} quizzes</Badge>
                        </div>
                      </div>
                      <Badge tone={topic.lessons_count > 0 && topic.quizzes_count > 0 ? 'success' : 'warning'}>
                        {topic.lessons_count > 0 && topic.quizzes_count > 0 ? 'Ready' : 'Needs attention'}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>

        <div className="space-y-6">
          {/* Featured topic */}
          {featuredTopic && (
            <Card className="bg-brand-50 p-5 dark:bg-brand-900/20">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-ink-900 dark:text-ink-100">Featured topic</h3>
                <PencilLine className="h-4 w-4 text-brand-500" />
              </div>
              <p className="mt-2 text-sm font-medium text-ink-800 dark:text-ink-200">{featuredTopic.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">{featuredTopic.description}</p>
              <div className="mt-4 flex gap-2">
                <Link to={`/teacher/curriculum/${featuredTopic.id}`}><Button variant="secondary" size="sm">Edit</Button></Link>
                <Link to="/teacher/content/lessons/new"><Button variant="ghost" size="sm"><Plus className="h-3.5 w-3.5" /> Add lesson</Button></Link>
              </div>
            </Card>
          )}

          {/* Content gaps */}
          <Card className={`p-5 ${contentGaps.length > 0 ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
            <div className="flex items-center gap-2">
              {contentGaps.length > 0 ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              <h3 className="text-base font-semibold text-ink-900 dark:text-ink-100">Content gaps</h3>
            </div>
            {contentGaps.length === 0 ? (
              <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">All topics are well-structured!</p>
            ) : (
              <div className="mt-3 space-y-2">
                {contentGaps.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/60 p-3 dark:bg-ink-800/60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-200">{topic.name}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {topic.lessons_count === 0 && topic.quizzes_count === 0 ? 'No lessons or quizzes' : topic.lessons_count === 0 ? 'No lessons' : 'No quizzes'}
                      </p>
                    </div>
                    <Link to={`/teacher/curriculum/${topic.id}`} className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">Fix <ArrowRight className="h-3 w-3" /></Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}