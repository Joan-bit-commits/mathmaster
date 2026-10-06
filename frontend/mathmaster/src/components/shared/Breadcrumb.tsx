import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

function titleize(segment: string): string { return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()); }
export function Breadcrumb({ items }: { items?: Array<{ label: string; href?: string }> }) {
  const location = useLocation();
  const generated = location.pathname.split('/').filter(Boolean).map((segment, index, all) => ({ label: titleize(segment), href: `/${all.slice(0, index + 1).join('/')}` }));
  const crumbs = items ?? generated;
  return <nav className="mb-6 flex items-center gap-1.5 text-sm text-ink-400" aria-label="Breadcrumb"><Link to="/dashboard" className="transition-colors hover:text-brand-600"><Home className="h-4 w-4" /></Link>{crumbs.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-1.5"><ChevronRight className="h-3.5 w-3.5 text-ink-300" />{item.href && index < crumbs.length - 1 ? <Link to={item.href} className="transition-colors hover:text-brand-600">{item.label}</Link> : <span className="max-w-[220px] truncate font-medium text-ink-700 dark:text-ink-300">{item.label}</span>}</span>)}</nav>;
}
