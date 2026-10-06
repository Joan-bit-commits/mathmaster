import { useRef } from 'react';
import { cn } from '@/lib/utils';

export function QuickPromptChips({
  prompts,
  onSelect,
  className,
}: {
  prompts: string[];
  onSelect: (prompt: string) => void;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={scrollRef} className={cn('flex gap-2 overflow-x-auto pb-1 scrollbar-thin', className)}>
      {prompts.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="shrink-0 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700 dark:hover:bg-brand-900/20"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
