import { cn } from '@/lib/utils';

export function ModeTabs<T extends string>({
  modes,
  value,
  onChange,
  className,
}: {
  modes: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-xl bg-ink-100 p-1 dark:bg-ink-800', className)}>
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-all',
            value === mode.value
              ? 'bg-white text-brand-700 shadow-sm dark:bg-ink-700 dark:text-brand-300'
              : 'text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200',
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
