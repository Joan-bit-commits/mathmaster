import type { ElementType } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/** A calm, neutral shortcut card. One icon colour (brand) everywhere keeps dashboards from looking like a rainbow. */
export function ActionTile({
  icon: Icon,
  title,
  description,
  to,
}: {
  icon: ElementType;
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700 dark:hover:bg-ink-800"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink-900 dark:text-ink-100">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-500 dark:text-ink-400">{description}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </Link>
  );
}
