import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SolutionStep } from './SolutionStep';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import type { WorkedExample } from '@/types/pillar1';

export function WorkedExampleCard({ example, index = 0 }: { example: WorkedExample; index?: number }) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="overflow-hidden p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Example {index + 1}</p>
            <MarkdownRenderer content={example.problem} className="prose-sm mt-2" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)} aria-label={expanded ? 'Hide solution' : 'Show solution'}>
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Hide' : 'Show solution'}
          </Button>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-4 space-y-3 border-t border-ink-100 pt-4 dark:border-ink-800">
                {example.solution_steps.map((step, i) => (
                  <SolutionStep key={i} step={step} index={i} />
                ))}
                <div className="rounded-xl bg-brand-500/10 px-4 py-3">
                  <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">Final answer</p>
                  <MarkdownRenderer content={example.final_answer} className="prose-sm mt-1" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
