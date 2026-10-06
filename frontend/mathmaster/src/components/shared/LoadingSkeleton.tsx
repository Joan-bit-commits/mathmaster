import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton({ variant = 'card' }: { variant?: 'card' | 'list' | 'hero' }) {
  if (variant === 'hero') return <div className="rounded-[2rem] bg-ink-800 p-8"><Skeleton className="h-7 w-48 bg-ink-700" /><Skeleton className="mt-3 h-4 w-72 bg-ink-700" /><div className="mt-10 grid grid-cols-3 gap-4"><Skeleton className="h-16 bg-ink-700" /><Skeleton className="h-16 bg-ink-700" /><Skeleton className="h-16 bg-ink-700" /></div></div>;
  if (variant === 'list') return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex items-center gap-4 rounded-2xl border border-ink-200 p-4 dark:border-ink-700"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-1/2" /><Skeleton className="mt-2 h-3 w-3/4" /></div></div>)}</div>;
  return <div className="rounded-3xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800"><Skeleton className="h-11 w-11 rounded-2xl" /><Skeleton className="mt-5 h-3 w-20" /><Skeleton className="mt-2 h-5 w-3/4" /><Skeleton className="mt-3 h-8 w-full" /><Skeleton className="mt-5 h-2 w-full" /></div>;
}

export function TopicsGridSkeleton() { return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} />)}</div>; }
