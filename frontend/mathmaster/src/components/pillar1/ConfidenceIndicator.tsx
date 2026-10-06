import { cn } from '@/lib/utils';

export function ConfidenceIndicator({ value, className }: { value: number; className?: string }) {
  const dots = 5;
  const filled = Math.round(value * dots);
  return (
    <div className={cn('flex items-center gap-1', className)} aria-label={`Confidence: ${Math.round(value * 100)}%`}>
      {Array.from({ length: dots }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 w-2 rounded-full transition-colors',
            i < filled ? (value >= 0.8 ? 'bg-emerald-500' : value >= 0.5 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-ink-200 dark:bg-ink-700',
          )}
        />
      ))}
      <span className="ml-1.5 text-xs font-medium text-ink-500">{Math.round(value * 100)}%</span>
    </div>
  );
}
