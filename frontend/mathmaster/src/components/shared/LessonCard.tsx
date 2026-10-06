import { Check, ChevronRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Lesson } from '@/types/learning';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function LessonCard({ lesson, topicId }: { lesson: Lesson; topicId?: string }) {
  const content = <><div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold', lesson.completed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300')}>{lesson.completed ? <Check className="h-5 w-5" /> : lesson.order}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{lesson.title}</h3><p className="mt-1 line-clamp-1 text-xs text-ink-400">{lesson.description}</p></div><div className="hidden items-center gap-2 sm:flex"><Badge tone="neutral"><Clock3 className="mr-1 h-3 w-3" />{lesson.duration_minutes} min</Badge><Badge tone={lesson.difficulty === 'Beginner' ? 'success' : lesson.difficulty === 'Intermediate' ? 'brand' : 'warning'}>{lesson.difficulty}</Badge></div><ChevronRight className="h-5 w-5 shrink-0 text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500" /></>;
  return topicId ? <Link to={`/lessons/${lesson.id}`} className="group flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-800">{content}</Link> : <div className="group flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-800">{content}</div>;
}
