import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, BellOff, Trash2, Check, AlertTriangle, Trophy, Sparkles } from 'lucide-react';
import { useNotifications } from '@/hooks/useTeacher';
import type { NotificationItem } from '@/types/teacher';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const toneConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  brand: { bg: 'bg-brand-100 dark:bg-brand-900/40', text: 'text-brand-600 dark:text-brand-300', icon: Sparkles },
  warning: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-300', icon: AlertTriangle },
  danger: { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-600 dark:text-rose-300', icon: AlertTriangle },
  success: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-300', icon: Trophy },
};

function groupByDate(items: NotificationItem[]) {
  const now = new Date();
  const today: NotificationItem[] = [];
  const yesterday: NotificationItem[] = [];
  const earlier: NotificationItem[] = [];
  for (const item of items) {
    const d = new Date(item.created_at);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400_000);
    if (diffDays === 0) today.push(item);
    else if (diffDays === 1) yesterday.push(item);
    else earlier.push(item);
  }
  return [{ label: 'Today', items: today }, { label: 'Yesterday', items: yesterday }, { label: 'Earlier', items: earlier }].filter((g) => g.items.length > 0);
}

export default function Notifications() {
  const notifQuery = useNotifications();
  const [items, setItems] = React.useState<NotificationItem[]>([]);

  React.useEffect(() => { if (notifQuery.data) setItems(notifQuery.data); }, [notifQuery.data]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const removeItem = (id: string) => setItems((prev) => prev.filter((n) => n.id !== id));

  const unreadCount = items.filter((n) => !n.read).length;
  const groups = groupByDate(items);

  if (notifQuery.isLoading) return <AppShell><div className="mx-auto max-w-2xl space-y-3">{Array.from({ length: 5 }).map((_, i) => <LoadingSkeleton key={i} variant="list" />)}</div></AppShell>;
  if (notifQuery.isError) return <AppShell><ErrorState onRetry={() => void notifQuery.refetch()} message="Could not load notifications." /></AppShell>;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && <p className="mt-1 text-sm text-brand-600">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllRead}><CheckCheck className="h-4 w-4" /> Mark all read</Button>}
        </div>

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800"><BellOff className="h-10 w-10 text-ink-300" /></div>
            <h3 className="mt-6 text-lg font-semibold text-ink-900 dark:text-ink-100">All caught up</h3>
            <p className="mt-1 text-sm text-ink-500">We'll let you know when something new happens.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-400">{group.label}</p>
                <div className="space-y-2">
                  {group.items.map((item, i) => {
                    const cfg = toneConfig[item.tone] ?? toneConfig.brand;
                    const Icon = cfg.icon;
                    return (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <Card className={cn('relative flex items-center gap-4 p-4', !item.read && 'border-l-4 border-l-brand-500')}>
                          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', cfg.bg)}><Icon className={cn('h-5 w-5', cfg.text)} /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{item.title}</p>
                            <p className="mt-0.5 line-clamp-1 text-sm text-ink-500 dark:text-ink-400">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-ink-400">{formatRelativeTime(item.created_at)}</span>
                            {!item.read && <button onClick={() => markRead(item.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-brand-500 dark:hover:bg-ink-700"><Check className="h-4 w-4" /></button>}
                            <button onClick={() => removeItem(item.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
