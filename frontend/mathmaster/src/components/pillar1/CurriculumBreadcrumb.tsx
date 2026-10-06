import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function CurriculumBreadcrumb({
  segments,
}: {
  segments: { label: string; href?: string }[];
}) {
  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Curriculum breadcrumb">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          {seg.href ? (
            <Link to={seg.href} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              {seg.label}
            </Link>
          ) : (
            <span className="font-medium text-ink-700 dark:text-ink-300">{seg.label}</span>
          )}
          {i < segments.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-ink-300" />}
        </span>
      ))}
    </nav>
  );
}
