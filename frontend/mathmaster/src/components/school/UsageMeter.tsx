import { cn } from '@/lib/utils';
import type { UsageMetric } from '@/types/school';

export function UsageMeter({ metric, className }: { metric: UsageMetric; className?: string }) {
  const color = metric.percent > 85 ? 'bg-rose-500' : metric.percent > 60 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{metric.label}</span>
        <span className="text-xs font-semibold text-ink-500">
          {metric.used.toLocaleString()}{metric.limit !== null ? ` / ${metric.limit.toLocaleString()}` : ' / ∞'}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(metric.percent, 100)}%` }} />
      </div>
      <p className="mt-1 text-right text-[10px] text-ink-400">{metric.percent}% used</p>
    </div>
  );
}
