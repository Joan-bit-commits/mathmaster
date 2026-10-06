import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardCheck, Clock3, ArrowLeft, ExternalLink } from 'lucide-react';
import { useTopic, useLessons } from '@/hooks/useLearning';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { LessonCard } from '@/components/shared/LessonCard';
import { LoadingSkeleton, TopicsGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Stat } from '@/components/ui/stat';
import { UNEBCodeBadge } from '@/components/pillar1/UNEBCodeBadge';
import { Link } from 'react-router-dom';

export default function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const topicQuery = useTopic(topicId);
  const lessonsQuery = useLessons(topicId);
  const topic = topicQuery.data;
  const lessons = lessonsQuery.data ?? [];

  if (topicQuery.isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div><div className="mt-6"><TopicsGridSkeleton /></div></AppShell>;
  if (topicQuery.isError || !topic) return <AppShell><ErrorState onRetry={() => void topicQuery.refetch()} message="We couldn't load this topic." /></AppShell>;

  const firstIncomplete = lessons.find((l) => !l.completed);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: 'Topics', href: '/topics' }, { label: topic.name }]} />
      <Card className="overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">{topic.level}</Badge>
              <Badge tone="neutral">{topic.subject}</Badge>
              <UNEBCodeBadge code={`${topic.level}.M.A.1`} />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">{topic.name}</h1>
            <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-400">{topic.description}</p>
            <Link to={`/curriculum/topic?code=${encodeURIComponent(`${topic.level}.M.A.1`)}`} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">View in syllabus <ExternalLink className="h-3 w-3" /></Link>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat title="Lessons" value={topic.lessons_count} icon={BookOpen} />
          <Stat title="Quizzes" value={topic.quizzes_count} icon={ClipboardCheck} />
          <Stat title="Est. time" value={`${topic.estimated_hours}h`} icon={Clock3} />
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">Your progress</h2>
          <span className="text-sm font-bold text-brand-600">{topic.progress}% complete</span>
        </div>
        <Progress value={topic.progress} className="mt-3 h-2.5" />
        <p className="mt-2 text-xs text-ink-500">{topic.lessons_completed} of {topic.lessons_count} lessons done</p>
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-900 dark:text-ink-100">Lessons</h2>
        {lessonsQuery.isLoading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} variant="list" />)}</div> :
         lessonsQuery.isError ? <ErrorState onRetry={() => void lessonsQuery.refetch()} message="Could not load lessons." /> :
         lessons.length === 0 ? <p className="text-sm text-ink-500">No lessons available yet.</p> :
         <div className="space-y-3">{lessons.map((lesson, i) => <motion.div key={lesson.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}><LessonCard lesson={lesson} topicId={topicId} /></motion.div>)}</div>}
      </div>

      <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-3 border-t border-ink-200 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/80">
        <Button variant="ghost" onClick={() => navigate('/topics')}><ArrowLeft className="h-4 w-4" /> Back to topics</Button>
        <Button variant="gradient" disabled={!firstIncomplete} onClick={() => firstIncomplete && navigate(`/lessons/${firstIncomplete.id}`)}>
          {firstIncomplete ? 'Continue learning' : 'All lessons done'}
        </Button>
      </div>
    </AppShell>
  );
}
