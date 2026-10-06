import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Section({ title, action, children, className }: { title: string; action?: { label: string; href: string }; children: ReactNode; className?: string }) { return <section className={cn('mt-10', className)}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold text-ink-900 dark:text-ink-100">{title}</h2>{action && <Link to={action.href} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">{action.label}<ArrowRight className="h-4 w-4" /></Link>}</div>{children}</section>; }
