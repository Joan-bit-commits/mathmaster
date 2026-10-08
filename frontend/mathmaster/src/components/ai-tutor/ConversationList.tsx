import * as React from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import type { AISession } from '@/types/learning';
import { Button } from '@/components/ui/button';
import { cn, formatRelativeTime } from '@/lib/utils';

export function ConversationList({
  sessions,
  activeId,
  loading,
  onSelect,
  onDelete,
  onNew,
}: {
  sessions: AISession[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}) {
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button variant="secondary" className="w-full justify-start" onClick={onNew}>
          <Plus className="h-4 w-4" /> New chat
        </Button>
      </div>
      <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Recent</p>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3 scrollbar-thin">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-ink-100 dark:bg-ink-800" />)
        ) : sessions.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-ink-400">Your conversations will appear here.</p>
        ) : (
          sessions.map((session) => {
            const active = session.id === activeId;
            const confirming = confirmId === session.id;
            return (
              <div
                key={session.id}
                className={cn(
                  'group relative rounded-lg transition-colors',
                  active ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-ink-100 dark:hover:bg-ink-800',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(session.id)}
                  aria-current={active ? 'true' : undefined}
                  className="block w-full min-w-0 px-3 py-2.5 pr-10 text-left"
                >
                  <span className="block truncate text-sm font-medium text-ink-800 dark:text-ink-100">
                    {session.preview || 'New conversation'}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-400">
                    <MessageSquare className="h-3 w-3" aria-hidden />
                    {session.topic} · {formatRelativeTime(session.created_at)}
                  </span>
                </button>
                {confirming ? (
                  <div className="absolute inset-y-0 right-1 flex items-center gap-1 rounded-lg bg-white pl-2 dark:bg-ink-900">
                    <button type="button" onClick={() => { onDelete(session.id); setConfirmId(null); }} className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700">
                      Delete
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-md px-2 py-1 text-xs font-medium text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(session.id)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-300 opacity-0 transition-opacity hover:bg-ink-200/60 hover:text-ink-700 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-ink-700"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
