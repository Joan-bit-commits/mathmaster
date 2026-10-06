import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Clock3, ClipboardCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLesson, useLessons, useTopic } from '@/hooks/useLearning';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { LoadingSkeleton, TopicsGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LessonDetail() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lessonQuery = useLesson(lessonId);
  const lesson = lessonQuery.data;
  const topicQuery = useTopic(lesson?.topic_id);
  const topic = topicQuery.data;
  const lessonsQuery = useLessons(lesson?.topic_id);
  const allLessons = lessonsQuery.data ?? [];
  const [completed, setCompleted] = React.useState(lesson?.completed ?? false);

  React.useEffect(() => { if (lesson) setCompleted(lesson.completed); }, [lesson]);

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (lessonQuery.isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div><div className="mt-6"><TopicsGridSkeleton /></div></AppShell>;
  if (lessonQuery.isError || !lesson) return <AppShell><ErrorState onRetry={() => void lessonQuery.refetch()} message="We couldn't load this lesson." /></AppShell>;

  const markComplete = () => { setCompleted(true); toast.success('Lesson marked as complete!'); };

  return (
    <AppShell>
      <Breadcrumb items={[{ label: 'Topics', href: '/topics' }, { label: topic?.name ?? 'Topic', href: `/topics/${lesson.topic_id}` }, { label: lesson.title }]} />
      <Card className="rounded-[2rem] p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">{lesson.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="neutral"><Clock3 className="mr-1 h-3 w-3" />{lesson.duration_minutes} min</Badge>
          <Badge tone={lesson.difficulty === 'Beginner' ? 'success' : lesson.difficulty === 'Intermediate' ? 'brand' : 'warning'}>{lesson.difficulty}</Badge>
          {completed && <Badge tone="success"><Check className="mr-1 h-3 w-3" />Completed</Badge>}
        </div>
      </Card>

      <Card className="mt-6 p-6 sm:p-8">
        <MarkdownRenderer content={lesson.content} />
        <div className="mt-8 border-t border-ink-200 pt-6 dark:border-ink-700">
          <Button variant={completed ? 'secondary' : 'gradient'} onClick={markComplete} disabled={completed}>
            {completed ? <><Check className="h-4 w-4" /> Completed</> : 'Mark as complete'}
          </Button>
        </div>
      </Card>

      <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-3 border-t border-ink-200 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/80">
        <Button variant="ghost" disabled={!prevLesson} onClick={() => prevLesson && navigate(`/lessons/${prevLesson.id}`)}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <div className="flex gap-2">
          <Link to={`/lessons/${lesson.id}/quizzes`}>
            <Button variant="secondary"><ClipboardCheck className="h-4 w-4" /> Take quiz</Button>
          </Link>
          <Button variant="gradient" disabled={!nextLesson} onClick={() => nextLesson && navigate(`/lessons/${nextLesson.id}`)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
