import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, ChevronDown, ChevronUp, RotateCcw, Share2, Sparkles, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAttempt, useQuiz } from '@/hooks/useLearning';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

function CountUp({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(target * progress));
      if (progress >= 1) window.clearInterval(interval);
    }, 30);
    return () => window.clearInterval(interval);
  }, [target, duration]);
  return <>{value}</>;
}

export default function QuizResults() {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const attemptQuery = useAttempt(quizId, attemptId);
  const quizQuery = useQuiz(quizId);
  const attempt = attemptQuery.data;
  const [expanded, setExpanded] = React.useState<Set<number>>(new Set([0]));

  React.useEffect(() => {
    if (attempt) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.3 }, colors: ['#0EA5E9', '#6366F1', '#10B981', '#F59E0B'] });
    }
  }, [attempt]);

  if (attemptQuery.isLoading) return <AppShell><div className="mx-auto max-w-3xl"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (attemptQuery.isError || !attempt) return <AppShell><ErrorState onRetry={() => void attemptQuery.refetch()} message="Could not load your results." /></AppShell>;

  const pct = attempt.percentage;
  const tier = pct >= 80 ? { label: 'Excellent', tone: 'success' as const, color: 'text-emerald-400' } : pct >= 60 ? { label: 'Good', tone: 'brand' as const, color: 'text-brand-400' } : { label: 'Keep practicing', tone: 'warning' as const, color: 'text-amber-400' };

  const toggle = (i: number) => setExpanded((prev) => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
  const share = () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied to clipboard!'); };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Breadcrumb items={[{ label: 'Quizzes', href: '/topics' }, { label: attempt.quiz_title, href: `/quizzes/${quizId}` }, { label: 'Results' }]} />
        <Card className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-900 to-ink-800 p-8 text-center shadow-hero">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>
          <p className="mt-6 text-5xl font-bold text-white"><CountUp target={pct} />%</p>
          <Badge tone={tier.tone} className="mt-4 text-sm">{tier.label}</Badge>
          <p className="mt-4 text-sm text-ink-300">You scored {attempt.score} out of {attempt.total} and earned <span className="font-bold text-yellow-300">{attempt.xp_earned} XP</span></p>
        </Card>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="gradient" onClick={() => navigate(`/quizzes/${quizId}`)}><RotateCcw className="h-4 w-4" /> Try again</Button>
          <Button variant="secondary" onClick={() => {
            const lessonId = quizQuery.data?.lesson_id;
            if (lessonId) navigate(`/lessons/${lessonId}`);
            else navigate('/topics');
          }}><ArrowLeft className="h-4 w-4" /> Back to lesson</Button>
          <Button variant="ghost" onClick={share}><Share2 className="h-4 w-4" /> Share</Button>
        </div>

        <h2 className="mb-4 mt-8 text-lg font-semibold text-ink-900 dark:text-ink-100">Review answers</h2>
        <div className="space-y-3">
          {attempt.answers.map((answer, i) => (
            <Card key={answer.question_id} className="overflow-hidden">
              <button onClick={() => toggle(i)} className="flex w-full items-center gap-3 p-4 text-left">
                <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', answer.is_correct ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300')}>
                  {answer.is_correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
                <span className="flex-1 text-sm font-medium text-ink-800 dark:text-ink-100"><MarkdownRenderer content={answer.question_text} className="prose-headings:text-sm prose-headings:font-medium prose-p:text-sm prose-p:font-medium prose-p:my-0" /></span>
                {expanded.has(i) ? <ChevronUp className="h-4 w-4 text-ink-400" /> : <ChevronDown className="h-4 w-4 text-ink-400" />}
              </button>
              <motion.div initial={false} animate={{ height: expanded.has(i) ? 'auto' : 0, opacity: expanded.has(i) ? 1 : 0 }} className="overflow-hidden">
                <div className="border-t border-ink-100 p-4 dark:border-ink-700">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-900/10">
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Your answer</p>
                      <p className="mt-1 text-sm text-ink-800 dark:text-ink-200">{answer.user_answer || 'No answer'}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/10">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Correct answer</p>
                      <p className="mt-1 text-sm text-ink-800 dark:text-ink-200">{answer.correct_answer}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-ink-500 dark:text-ink-400">{answer.explanation}</p>
                </div>
              </motion.div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
