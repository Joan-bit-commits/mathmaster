import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import type { SolutionStep as SolutionStepType } from '@/types/pillar1';

const markStyles: Record<string, string> = {
  M1: 'bg-brand-500/10 text-brand-700 dark:text-brand-300',
  A1: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  B1: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  cao: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
};

export function SolutionStep({ step, index = 0 }: { step: SolutionStepType; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex gap-3"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
        {step.step_number}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <MarkdownRenderer content={step.text} className="prose-sm" />
          </div>
          <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold', markStyles[step.mark] ?? markStyles.M1)}>
            {step.mark}
          </span>
        </div>
        {step.explanation && <p className="mt-1 text-xs text-ink-400">{step.explanation}</p>}
      </div>
    </motion.div>
  );
}
