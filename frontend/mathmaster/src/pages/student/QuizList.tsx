import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useQuizzes, useLesson } from '@/hooks/useLearning';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { QuizCard } from '@/components/shared/QuizCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';

export default function QuizList() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const quizzesQuery = useQuizzes(lessonId);
  const lessonQuery = useLesson(lessonId);
  const quizzes = quizzesQuery.data ?? [];

  return (
    <AppShell>
      <Breadcrumb items={[{ label: 'Topics', href: '/topics' }, { label: lessonQuery.data?.title ?? 'Lesson', href: `/lessons/${lessonId}` }, { label: 'Quizzes' }]} />
      <PageHeader title="Quizzes" description="Test what you've learned." />
      <div className="mb-6"><Button variant="ghost" onClick={() => navigate(`/lessons/${lessonId}`)}><ArrowLeft className="h-4 w-4" /> Back to lesson</Button></div>
      {quizzesQuery.isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} />)}</div> :
       quizzesQuery.isError ? <ErrorState onRetry={() => void quizzesQuery.refetch()} message="Could not load quizzes." /> :
       quizzes.length === 0 ? (
         <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-300 bg-white p-12 text-center dark:border-ink-600 dark:bg-ink-800">
           <ClipboardList className="h-10 w-10 text-ink-300" />
           <h3 className="mt-4 text-base font-semibold text-ink-900 dark:text-ink-100">No quizzes for this lesson yet</h3>
           <p className="mt-1 text-sm text-ink-500">Check back soon — new quizzes are being added.</p>
         </div>
       ) : (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {quizzes.map((quiz, i) => <motion.div key={quiz.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}><QuizCard quiz={quiz} /></motion.div>)}
         </div>
       )}
    </AppShell>
  );
}
