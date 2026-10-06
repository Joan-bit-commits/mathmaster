import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Library } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UNEBCodeBadge } from '@/components/pillar1/UNEBCodeBadge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchLevels } from '@/services/curriculum';
import { mockLevels } from '@/mocks/pillar1Mocks';
import { cn } from '@/lib/utils';
import type { CurriculumLevel, CurriculumStrand } from '@/types/pillar1';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const levelCodes = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

export default function CurriculumIndex() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = React.useState('S1');
  const [expandedSubject, setExpandedSubject] = React.useState<string | null>(null);
  const [expandedStrand, setExpandedStrand] = React.useState<string | null>(null);

  const { data: levels, isLoading, isError, refetch } = useQuery({
    queryKey: ['curriculum-levels'],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockLevels) : fetchLevels()),
  });

  const currentLevel: CurriculumLevel | undefined = levels?.find((l) => l.code === selectedLevel) ?? levels?.[0];

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load the curriculum." /></AppShell>;

  return (
    <AppShell>
      <PageHeader title="Curriculum" description="Browse the Uganda secondary mathematics syllabus (S1–S6)." />

      <div className="mt-4 flex flex-wrap gap-2">
        {levelCodes.map((code) => (
          <button key={code} onClick={() => { setSelectedLevel(code); setExpandedSubject(null); setExpandedStrand(null); }} className={cn('rounded-full px-4 py-2 text-sm font-semibold transition-all', selectedLevel === code ? 'bg-brand-500 text-white shadow-soft' : 'bg-ink-100 text-ink-600 hover:bg-brand-50 hover:text-brand-700 dark:bg-ink-800 dark:text-ink-400')}>
            {code}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {currentLevel?.subjects.map((subject) => (
          <Card key={subject.code} className="overflow-hidden">
            <button onClick={() => setExpandedSubject(expandedSubject === subject.code ? null : subject.code)} className="flex w-full items-center justify-between p-5 text-left">
              <div className="flex items-center gap-3">
                <Library className="h-5 w-5 text-brand-500" />
                <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">{subject.name}</span>
                <Badge tone="neutral">{subject.strands.length} strands</Badge>
              </div>
              <ChevronRight className={cn('h-4 w-4 text-ink-400 transition-transform', expandedSubject === subject.code && 'rotate-90')} />
            </button>
            <AnimatePresence>
              {expandedSubject === subject.code && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-ink-100 dark:border-ink-800">
                  {subject.strands.map((strand: CurriculumStrand) => (
                    <div key={strand.code}>
                      <button onClick={() => setExpandedStrand(expandedStrand === strand.code ? null : strand.code)} className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-ink-50 dark:hover:bg-ink-800/50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{strand.name}</span>
                          <UNEBCodeBadge code={strand.code} />
                          <Badge tone="brand">{strand.objectives.length} objectives</Badge>
                        </div>
                        <ChevronRight className={cn('h-3.5 w-3.5 text-ink-400 transition-transform', expandedStrand === strand.code && 'rotate-90')} />
                      </button>
                      <AnimatePresence>
                        {expandedStrand === strand.code && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-ink-50 bg-ink-50/50 dark:border-ink-900 dark:bg-ink-900/30">
                            {strand.objectives.map((obj) => (
                              <button key={obj.code} onClick={() => navigate(`/curriculum/topic?code=${encodeURIComponent(obj.code)}`)} className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-brand-50 dark:hover:bg-brand-900/20">
                                <div className="flex items-center gap-2">
                                  <UNEBCodeBadge code={obj.code} />
                                  <span className="text-sm text-ink-700 dark:text-ink-300">{obj.title}</span>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
