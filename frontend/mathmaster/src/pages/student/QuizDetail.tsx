import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Clock3, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuiz, useQuestions, useSubmitAttempt } from '@/hooks/useLearning';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export default function QuizDetail() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const quizQuery = useQuiz(quizId);
  const questionsQuery = useQuestions(quizId);
  const submitMutation = useSubmitAttempt();
  const quiz = quizQuery.data;
  const questions = questionsQuery.data ?? [];

  const [current, setCurrent] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [startTime] = React.useState(Date.now());
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const interval = window.setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => window.clearInterval(interval);
  }, [startTime]);

  if (quizQuery.isLoading || questionsQuery.isLoading) return <AppShell><div className="mx-auto max-w-3xl"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (quizQuery.isError || !quiz) return <AppShell><ErrorState onRetry={() => void quizQuery.refetch()} message="Could not load this quiz." /></AppShell>;
  if (questions.length === 0) return <AppShell><ErrorState message="This quiz has no questions yet." /></AppShell>;

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const progress = ((current + 1) / questions.length) * 100;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSubmit = async () => {
    try {
      const attempt = await submitMutation.mutateAsync({ quizId: quizId!, answers });
      navigate(`/quizzes/${quizId}/results/${attempt.id}`);
    } catch {
      toast.error('Could not submit your answers. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLast) void handleSubmit();
      else if (answers[question.id]) setCurrent((c) => c + 1);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Breadcrumb items={[{ label: 'Quizzes', href: '/topics' }, { label: quiz.title }]} />
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white">{quiz.title}</h1>
            <p className="mt-1 text-sm text-ink-500">Question {current + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-ink-100 px-3 py-2 text-sm font-semibold text-ink-700 dark:bg-ink-700 dark:text-ink-200">
            <Clock3 className="h-4 w-4" /> {formatTime(elapsed)}
          </div>
        </div>
        <Progress value={progress} className="mb-6 h-2" />

        <AnimatePresence mode="wait">
          <motion.div key={question.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <Card className="p-6 sm:p-8">
              <MarkdownRenderer content={question.text} className="prose-headings:text-lg prose-headings:font-semibold prose-p:text-lg prose-p:font-semibold prose-p:leading-7 prose-p:text-ink-900 dark:prose-p:text-ink-100" />
              <div className="mt-6 space-y-3" onKeyDown={handleKeyDown}>
                {question.type === 'multiple_choice' && question.choices?.map((choice, i) => {
                  const selected = answers[question.id] === choice;
                  return (
                    <button key={i} onClick={() => setAnswers((a) => ({ ...a, [question.id]: choice }))} className={cn('flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all', selected ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-ink-200 hover:border-brand-200 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-700/50')}>
                      <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', selected ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300')}>{LETTERS[i]}</span>
                      <span className="text-sm text-ink-800 dark:text-ink-100">{choice}</span>
                      {selected && <Check className="ml-auto h-5 w-5 text-brand-500" />}
                    </button>
                  );
                })}
                {question.type === 'short_answer' && (
                  <Input value={answers[question.id] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [question.id]: e.target.value }))} placeholder="Type your answer..." className="h-12" autoFocus />
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Button>
          {isLast ? (
            <Button variant="gradient" loading={submitMutation.isPending} onClick={() => void handleSubmit()}><Send className="h-4 w-4" /> Submit</Button>
          ) : (
            <Button variant="gradient" disabled={!answers[question.id]} onClick={() => setCurrent((c) => c + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
