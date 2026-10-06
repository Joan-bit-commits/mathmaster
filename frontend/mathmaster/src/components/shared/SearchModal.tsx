import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Mic, ChevronRight, BookOpen, ClipboardCheck, Library, GraduationCap, Clock } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import { useSearch } from '@/hooks/useTeacher';
import { useAuthStore } from '@/stores/authStore';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/types/teacher';

const typeConfig: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  topic: { icon: Library, bg: 'bg-brand-100 dark:bg-brand-900/40', text: 'text-brand-600 dark:text-brand-300' },
  lesson: { icon: BookOpen, bg: 'bg-accent-100 dark:bg-indigo-900/40', text: 'text-accent-600 dark:text-indigo-300' },
  quiz: { icon: ClipboardCheck, bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-300' },
  student: { icon: GraduationCap, bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-300' },
};

const RECENT_KEY = 'mathmaster-recent-searches';

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function addRecent(q: string) {
  const recent = getRecent().filter((s) => s !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...recent].slice(0, 5)));
}

export function SearchModal() {
  const { isOpen, close } = useSearchStore();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? 'student') as 'student' | 'teacher';
  const [query, setQuery] = React.useState('');
  const [recent, setRecent] = React.useState<string[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const debouncedQuery = useDebounce(query, 200);
  const searchQuery = useSearch(debouncedQuery, role);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setRecent(getRecent());
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const results = searchQuery.data ?? [];
  const flatResults = results;

  React.useEffect(() => { setActiveIndex(0); }, [debouncedQuery]);

  const selectResult = (r: SearchResult) => {
    addRecent(query);
    close();
    navigate(r.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && flatResults[activeIndex]) { e.preventDefault(); selectResult(flatResults[activeIndex]); }
    else if (e.key === 'Escape') { close(); }
  };

  const removeRecent = (item: string) => {
    const updated = getRecent().filter((s) => s !== item);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    setRecent(updated);
  };

  const showResults = debouncedQuery.length > 0;
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => { (acc[r.type] ??= []).push(r); return acc; }, {});
  const groupOrder: { key: string; label: string }[] = [
    { key: 'topic', label: 'Topics' },
    { key: 'lesson', label: 'Lessons' },
    { key: 'quiz', label: 'Quizzes' },
    { key: 'student', label: 'Students' },
  ];

  let runningIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-900/40 backdrop-blur-sm" onClick={close}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="mt-[10vh] w-full max-w-xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-hero dark:border-ink-700 dark:bg-ink-800"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3 dark:border-ink-700">
              <Search className="h-5 w-5 text-ink-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search topics, lessons, quizzes..."
                className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-100"
              />
              <Mic className="h-4 w-4 text-ink-300" />
              {query && <button onClick={() => setQuery('')} className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700"><X className="h-4 w-4" /></button>}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {/* Recent searches */}
              {!showResults && recent.length > 0 && (
                <div className="p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">Recent searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((item) => (
                      <div key={item} className="flex items-center gap-1.5 rounded-full bg-ink-100 py-1.5 pl-3 pr-1.5 dark:bg-ink-700">
                        <button onClick={() => setQuery(item)} className="flex items-center gap-1.5 text-xs font-medium text-ink-600 dark:text-ink-300"><Clock className="h-3 w-3" />{item}</button>
                        <button onClick={() => removeRecent(item)} className="rounded-full p-0.5 text-ink-400 hover:text-rose-500"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live results */}
              {showResults && (
                <div className="p-2">
                  {searchQuery.isLoading ? (
                    <div className="space-y-2 p-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-ink-100 animate-pulse dark:bg-ink-700" />)}</div>
                  ) : flatResults.length === 0 ? (
                    <div className="py-8 text-center">
                      <Search className="mx-auto h-8 w-8 text-ink-300" />
                      <p className="mt-3 text-sm text-ink-500">No results for "{debouncedQuery}"</p>
                    </div>
                  ) : (
                    groupOrder.map((group) => {
                      const items = grouped[group.key];
                      if (!items?.length) return null;
                      return (
                        <div key={group.key} className="mb-1">
                          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">{group.label}</p>
                          {items.map((r) => {
                            const cfg = typeConfig[r.type] ?? typeConfig.topic;
                            const Icon = cfg.icon;
                            const idx = runningIndex++;
                            return (
                              <button
                                key={r.id}
                                onClick={() => selectResult(r)}
                                onMouseEnter={() => setActiveIndex(idx)}
                                className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors', activeIndex === idx ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-ink-50 dark:hover:bg-ink-700/50')}
                              >
                                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', cfg.bg)}><Icon className={cn('h-4 w-4', cfg.text)} /></div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{r.title}</p>
                                  <p className="truncate text-xs text-ink-400">{r.subtitle}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
                              </button>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Empty initial state */}
              {!showResults && recent.length === 0 && (
                <div className="py-10 text-center">
                  <Search className="mx-auto h-8 w-8 text-ink-300" />
                  <p className="mt-3 text-sm text-ink-500">Start typing to search</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-ink-100 px-4 py-2.5 dark:border-ink-700">
              <div className="flex items-center gap-3 text-xs text-ink-400">
                <span className="flex items-center gap-1"><kbd className="rounded border border-ink-200 bg-ink-100 px-1 dark:border-ink-600 dark:bg-ink-700">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="rounded border border-ink-200 bg-ink-100 px-1 dark:border-ink-600 dark:bg-ink-700">↵</kbd> Select</span>
                <span className="flex items-center gap-1"><kbd className="rounded border border-ink-200 bg-ink-100 px-1 dark:border-ink-600 dark:bg-ink-700">Esc</kbd> Close</span>
              </div>
              <button onClick={close} className="text-xs font-medium text-brand-600 hover:text-brand-700">Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
