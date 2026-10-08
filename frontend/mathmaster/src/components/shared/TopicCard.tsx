import { Link } from 'react-router-dom';
import { BarChart3, Compass, FunctionSquare, Hash, Infinity as InfinityIcon, Sigma, Triangle, TrendingUp } from 'lucide-react';
import type { Topic } from '@/types/learning';
import { Progress } from '@/components/ui/progress';

const iconMap = { Sigma, FunctionSquare, Triangle, TrendingUp, BarChart3, Compass, Hash, Infinity: InfinityIcon };

export function TopicCard({ topic, index = 0 }: { topic: Topic; index?: number }) {
  const Icon = iconMap[topic.icon as keyof typeof iconMap] ?? Sigma;
  return (
    <Link
      to={`/topics/${topic.id}`}
      className="group block rounded-2xl border border-ink-200 bg-white p-5 transition-colors hover:border-brand-300 dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:bg-ink-700 dark:text-ink-300">
          {topic.level}
        </span>
      </div>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">{topic.subject}</p>
      <h3 className="mt-1.5 line-clamp-2 text-lg font-semibold leading-snug text-ink-900 dark:text-ink-100">{topic.name}</h3>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-ink-500 dark:text-ink-400">{topic.description}</p>
      <div className="mt-5 flex items-center justify-between text-xs">
        <span className="font-medium text-ink-500 dark:text-ink-400">
          {topic.lessons_completed} of {topic.lessons_count} lessons
        </span>
        <span className="font-bold text-brand-600 dark:text-brand-400">{topic.progress}%</span>
      </div>
      <Progress value={topic.progress} className="mt-2 h-1.5" indicatorClassName="bg-brand-600" />
    </Link>
  );
}