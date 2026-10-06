import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, SlidersHorizontal, Plus, PencilLine } from 'lucide-react';
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

const LEVELS = ['All', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'University', 'Incomplete'];

export default function Curriculum() {
  const [search, setSearch] = React.useState('');
  const [level, setLevel] = React.useState('All');
  const [sort, setSort] = React.useState('Recent');
  const debouncedSearch = useDebounce(search, 300);

  const effectiveLevel = level === 'Incomplete' ? 'All' : level;
  const { data, isLoading, isError, refetch } = useTopics({ search: debouncedSearch, level: effectiveLevel, page: 1 });
  const topics = data?.results ?? [];

  const filtered = React.useMemo(() => {
    let result = [...topics];
    if (level === 'Incomplete') result = result.filter((t) => t.lessons_count === 0 || t.quizzes_count === 0);
    if (sort === 'A-Z') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'Coverage') result.sort((a, b) => b.progress - a.progress);
    return result;
  }, [topics, level, sort]);

  const clearFilters = () => { setSearch(''); setLevel('All'); setSort('Recent'); };
  const hasActiveFilters = search || level !== 'All';

  return (
    <AppShell>
      <PageHeader title="Curriculum" description="Manage your topics, lessons, and quizzes." />
      <div className="sticky top-16 z-20 -mx-4 mt-4 border-b border-ink-200 bg-ink-50/80 px-4 py-3 backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/80 sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search topics..." className="pl-10" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 rounded p-1 text-ink-400 hover:text-ink-700"><X className="h-4 w-4" /></button>}
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="sm:w-40"><SlidersHorizontal className="mr-2 h-4 w-4 text-ink-400" /><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Recent">Recent</SelectItem><SelectItem value="A-Z">A–Z</SelectItem><SelectItem value="Coverage">Coverage</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={cn('rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all', level === l ? 'bg-brand-500 text-white shadow-soft' : 'bg-white text-ink-500 hover:bg-brand-50 hover:text-brand-600 dark:bg-ink-800 dark:text-ink-400 dark:hover:bg-ink-700', l === 'Incomplete' && level === l && 'bg-amber-500 text-white')}>{l}</button>
          ))}
          {hasActiveFilters && <button onClick={clearFilters} className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300"><X className="h-3 w-3" /> Clear</button>}
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? <TopicsGridSkeleton /> : isError ? <ErrorState onRetry={() => void refetch()} /> : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-300 bg-white p-12 text-center dark:border-ink-600 dark:bg-ink-800">
            <Search className="h-10 w-10 text-ink-300" />
            <h3 className="mt-4 text-base font-semibold text-ink-900 dark:text-ink-100">No topics match your filters</h3>
            <Button variant="secondary" size="sm" onClick={clearFilters} className="mt-5">Clear filters</Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((topic, i) => (
              <motion.div key={topic.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative">
                <Link to={`/teacher/curriculum/${topic.id}`}>
                  <div className="relative">
                    <TopicCard topic={topic} index={i} />
                    <button
                      onClick={(e) => { e.preventDefault(); window.location.href = `/teacher/curriculum/${topic.id}`; }}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-ink-500 opacity-0 shadow-soft transition-all hover:text-brand-600 group-hover:opacity-100 dark:bg-ink-800/90"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Link to="/teacher/content/topics/new" className="fixed bottom-8 right-8 z-30">
        <Button variant="gradient" size="lg" className="shadow-hero"><Plus className="h-5 w-5" /> New topic</Button>
      </Link>
    </AppShell>
  );
}
