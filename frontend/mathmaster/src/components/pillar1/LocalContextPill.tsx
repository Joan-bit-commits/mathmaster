export function LocalContextPill({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 ${className ?? ''}`}
    >
      {label}
    </span>
  );
}
