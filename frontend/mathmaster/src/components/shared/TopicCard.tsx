import { Link } from 'react-router-dom';
import { BarChart3, Compass, FunctionSquare, Hash, Infinity as InfinityIcon, Sigma, Triangle, TrendingUp } from 'lucide-react';
import type { Topic } from '@/types/learning';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const iconMap = { Sigma, FunctionSquare, Triangle, TrendingUp, BarChart3, Compass, Hash, Infinity: InfinityIcon };
const colorMap: Record<string, { strip: string; icon: string; glow: string }> = {
  brand: { strip: 'from-brand-500 to-brand-300', icon: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300', glow: 'hover:shadow-[0_12px_35px_rgba(14,165,233,0.2)]' },
  accent: { strip: 'from-accent-500 to-indigo-400', icon: 'bg-indigo-100 text-accent-600 dark:bg-indigo-900/30 dark:text-indigo-300', glow: 'hover:shadow-[0_12px_35px_rgba(99,102,241,0.2)]' },
  success: { strip: 'from-emerald-500 to-teal-300', icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300', glow: 'hover:shadow-[0_12px_35px_rgba(16,185,129,0.2)]' },
  warning: { strip: 'from-amber-500 to-yellow-300', icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300', glow: 'hover:shadow-[0_12px_35px_rgba(245,158,11,0.2)]' },
  danger: { strip: 'from-rose-500 to-pink-300', icon: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300', glow: 'hover:shadow-[0_12px_35px_rgba(244,63,94,0.2)]' },
};

export function TopicCard({ topic, index = 0 }: { topic: Topic; index?: number }) {
  const Icon = iconMap[topic.icon as keyof typeof iconMap] ?? Sigma;
  const colors = colorMap[topic.color] ?? colorMap.brand;
  return <Link to={`/topics/${topic.id}`} className={cn('group relative block overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 dark:border-ink-700 dark:bg-ink-800', colors.glow)} style={{ animationDelay: `${index * 50}ms` }}><div className={cn('h-1 bg-gradient-to-r', colors.strip)} /><div className="p-5"><div className="flex items-start justify-between"><div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', colors.icon)}><Icon className="h-5 w-5" /></div><span className="rounded-full bg-ink-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:bg-ink-700 dark:text-ink-300">{topic.level}</span></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">{topic.subject}</p><h3 className="mt-1.5 line-clamp-2 text-lg font-semibold leading-snug text-ink-900 dark:text-ink-100">{topic.name}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-ink-500 dark:text-ink-400">{topic.description}</p><div className="mt-5 flex items-center justify-between text-xs"><span className="font-medium text-ink-500 dark:text-ink-400">{topic.lessons_completed} of {topic.lessons_count} lessons</span><span className="font-bold text-brand-600 dark:text-brand-400">{topic.progress}%</span></div><Progress value={topic.progress} className="mt-2 h-1.5" indicatorClassName={cn('bg-gradient-to-r', colors.strip)} /></div></Link>;
}
