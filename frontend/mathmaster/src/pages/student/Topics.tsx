import * as React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTopics } from '@/hooks/useLearning';
import { useDebounce } from '@/hooks/useDebounce';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TopicCard } from '@/components/shared/TopicCard';
import { TopicsGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

const LEVELS = ['All', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'University'];

export default function Topics() {
  const [search, setSearch] = React.useState('');
  const [level, setLevel] = React.useState('All');
  const [sort, setSort] = React.useState('Recent');
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useTopics({ search: debouncedSearch, level, page });
  const topics = data?.results ?? [];
  const hasMore = data?.hasMore ?? false;

  const clearFilters = () => { setSearch(''); setLevel('All'); setSort('Recent'); setPage(1); };
  const hasActiveFilters = search || level !== 'All';

  const sorted = React.useMemo(() => {
    if (!topics.length) return [];
    if (sort === 'A-Z') return [...topics].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'Progress') return [...topics].sort((a, b) => b.progress - a.progress);
    return topics;
  }, [topics, sort]);

  return (
    <AppShell>
      <PageHeader title="Explore Topics" description="Find your next challenge across every level." />
      <div className="sticky top-16 z-20 -mx-4 mt-4 border-b border-ink-200 bg-ink-50/80 px-4 py-3 backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/80 sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search topics..." className="pl-10" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 rounded p-1 text-ink-400 hover:text-ink-700"><X className="h-4 w-4" /></button>}
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="sm:w-40"><SlidersHorizontal className="mr-2 h-4 w-4 text-ink-400" /><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Recent">Recent</SelectItem><SelectItem value="A-Z">A–Z</SelectItem><SelectItem value="Progress">Progress</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => { setLevel(l); setPage(1); }} className={cn('rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all', level === l ? 'bg-brand-500 text-white shadow-soft' : 'bg-white text-ink-500 hover:bg-brand-50 hover:text-brand-600 dark:bg-ink-800 dark:text-ink-400 dark:hover:bg-ink-700')}>{l}</button>
          ))}
          {hasActiveFilters && <button onClick={clearFilters} className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300"><X className="h-3 w-3" /> Clear</button>}
        </div>
      </div>
      <div className="mt-6">
        {isLoading ? <TopicsGridSkeleton /> : isError ? <ErrorState onRetry={() => void refetch()} /> : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-300 bg-white p-12 text-center dark:border-ink-600 dark:bg-ink-800">
            <Search className="h-10 w-10 text-ink-300" />
            <h3 className="mt-4 text-base font-semibold text-ink-900 dark:text-ink-100">No topics match your filters</h3>
            <p className="mt-1 text-sm text-ink-500">Try adjusting your search or level filter.</p>
            <Button variant="secondary" size="sm" onClick={clearFilters} className="mt-5">Clear filters</Button>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((topic, i) => <motion.div key={topic.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}><TopicCard topic={topic} index={i} /></motion.div>)}
            </div>
            {hasMore && <div className="mt-8 flex justify-center"><Button variant="secondary" onClick={() => setPage((p) => p + 1)}>Load more topics</Button></div>}
          </>
        )}
      </div>
    </AppShell>
  );
}
