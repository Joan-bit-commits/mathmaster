import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      tone: {
        brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
        accent: 'bg-indigo-100 text-accent-600 dark:bg-indigo-900/40 dark:text-indigo-300',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        danger: 'bg-rose-100 text-danger dark:bg-rose-900/40 dark:text-rose-300',
        neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
