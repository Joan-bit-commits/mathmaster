import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function UNEBCodeBadge({ code, className }: { code: string; className?: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/curriculum/topic?code=${encodeURIComponent(code)}`)}
      className={cn(
        'inline-flex items-center rounded-full bg-brand-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-500/20 dark:bg-brand-500/20 dark:text-brand-300',
        className,
      )}
      aria-label={`View ${code} in syllabus`}
    >
      {code}
    </button>
  );
}
