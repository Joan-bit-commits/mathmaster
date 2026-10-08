import * as React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, AlertTriangle, Brain, Play, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CurriculumBreadcrumb } from '@/components/pillar1/CurriculumBreadcrumb';
import { UNEBCodeBadge } from '@/components/pillar1/UNEBCodeBadge';
import { WorkedExampleCard } from '@/components/pillar1/WorkedExampleCard';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchObjective, fetchWorkedExamples, fetchLocalProblems } from '@/services/curriculum';
import { mockLevels, mockWorkedExamples, mockLocalProblems } from '@/mocks/pillar1Mocks';
import { cn } from '@/lib/utils';
import type { CurriculumObjective } from '@/types/pillar1';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const difficultyTone: Record<string, 'success' | 'warning' | 'danger'> = { easy: 'success', medium: 'warning', hard: 'danger' };

export default function CurriculumTopic() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') ?? 'S1.M.A.1';
  const navigate = useNavigate();
  const parts = code.split('.');

  const { data: objective, isLoading, isError, refetch } = useQuery({
    queryKey: ['curriculum-objective', code],
    queryFn: () => {
      if (USE_MOCKS) {
        for (const level of mockLevels) {
          for (const subject of level.subjects) {
            for (const strand of subject.strands) {
              const found = strand.objectives.find((o) => o.code === code);
              if (found) return Promise.resolve(found as CurriculumObjective);
            }
          }
        }
        return Promise.resolve(mockLevels[0].subjects[0].strands[0].objectives[0]);
      }
      return fetchObjective(code);
    },
  });

  const { data: examples } = useQuery({
    queryKey: ['curriculum-examples', code],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockWorkedExamples) : fetchWorkedExamples(code)),
  });

  const { data: problems } = useQuery({
    queryKey: ['curriculum-problems', code],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockLocalProblems) : fetchLocalProblems(code)),
  });

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError || !objective) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load this topic." /></AppShell>;

  return (
    <AppShell>
      <Button variant="ghost" onClick={() => navigate('/curriculum')}><ArrowLeft className="h-4 w-4" /> Back to curriculum</Button>

      <div className="mt-4">
        <CurriculumBreadcrumb segments={[
          { label: parts[0] ?? 'S1', href: '/curriculum' },
          { label: objective.subject, href: '/curriculum' },
          { label: objective.strand, href: '/curriculum' },
          { label: objective.title },
        ]} />
      </div>

      <Card className="mt-4 p-6">
        <div className="flex items-center gap-3">
          <UNEBCodeBadge code={objective.code} />
          <Badge tone={difficultyTone[objective.difficulty] ?? 'neutral'} className="capitalize">{objective.difficulty}</Badge>
          <Badge tone="neutral">{objective.estimated_hours}h</Badge>
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 dark:text-white">{objective.title}</h1>
        <MarkdownRenderer content={objective.description} className="prose-sm mt-3" />
      </Card>

      <Tabs defaultValue="objectives" className="mt-6">
        <TabsList>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="misconceptions">Misconceptions</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        <TabsContent value="objectives">
          <Card className="p-5">
            <MarkdownRenderer content={objective.description} className="prose-sm" />
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Workbook references</p>
              <ul className="mt-2 space-y-1">
                {objective.workbook_refs.map((ref, i) => <li key={i} className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300"><BookOpen className="h-3.5 w-3.5 text-brand-500" /> {ref}</li>)}
              </ul>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <div className="space-y-4">
            {(examples ?? []).map((ex, i) => <WorkedExampleCard key={ex.id} example={ex} index={i} />)}
            {(examples ?? []).length === 0 && <Card className="p-8 text-center"><p className="text-sm text-ink-500">No worked examples available for this topic yet.</p></Card>}
          </div>
        </TabsContent>

        <TabsContent value="misconceptions">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400"><AlertTriangle className="h-4 w-4" /> Common misconceptions</div>
            <ul className="mt-4 space-y-2">
              {objective.misconceptions.map((m, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" /> {m}
                </motion.li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => navigate('/topics')}><Play className="h-4 w-4" /> Start a quiz</Button>
              <Button variant="secondary" onClick={() => navigate('/ai-tutor')}><Brain className="h-4 w-4" /> Ask AI tutor</Button>
            </div>
            <div className="space-y-3">
              {(problems ?? []).map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4">
                    <div className="flex items-center gap-2"><Badge tone={difficultyTone[p.difficulty] ?? 'neutral'} className="capitalize">{p.difficulty}</Badge><Badge tone="brand">{p.context_tags.join(', ')}</Badge></div>
                    <p className="mt-2 text-sm text-ink-700 dark:text-ink-300">{p.context}</p>
                    <p className="mt-1 text-sm font-medium text-ink-900 dark:text-ink-100">{p.problem}</p>
                    <details className="mt-2"><summary className="cursor-pointer text-xs font-medium text-brand-600">Show answer</summary><p className="mt-1 text-sm font-semibold text-emerald-600">{p.answer}</p></details>
                  </Card>
                </motion.div>
              ))}
              {(problems ?? []).length === 0 && <Card className="p-8 text-center"><MessageSquare className="mx-auto h-8 w-8 text-ink-300" /><p className="mt-3 text-sm text-ink-500">No practice problems yet for this topic.</p></Card>}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
