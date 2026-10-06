import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ClipboardCheck, Library, Plus, FileText, ArrowRight, X } from 'lucide-react';
import { useContentActivity, useTeacherOverview } from '@/hooks/useTeacher';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatRelativeTime } from '@/lib/utils';

const typeIcons: Record<string, React.ElementType> = { topic: Library, lesson: BookOpen, quiz: ClipboardCheck, question: FileText };
const actionTones: Record<string, 'success' | 'brand' | 'danger'> = { created: 'success', updated: 'brand', deleted: 'danger' };

export default function ContentHub() {
  const overviewQuery = useTeacherOverview();
  const activityQuery = useContentActivity();
  const ov = overviewQuery.data;
  const activity = activityQuery.data ?? [];
  const [fabOpen, setFabOpen] = React.useState(false);

  const tiles = [
    { label: 'Topics', count: ov?.topics_count ?? 0, icon: Library, gradient: 'from-brand-500 to-brand-600', href: '/teacher/curriculum' },
    { label: 'Lessons', count: ov?.lessons_count ?? 0, icon: BookOpen, gradient: 'from-accent-500 to-indigo-600', href: '/teacher/content/lessons/new' },
    { label: 'Quizzes & Questions', count: ov?.quizzes_count ?? 0, icon: ClipboardCheck, gradient: 'from-amber-500 to-orange-600', href: '/teacher/content/quizzes/new' },
  ];

  return (
    <AppShell>
      <PageHeader title="Content authoring" description="Manage all your curriculum in one place." />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <motion.div key={tile.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="overflow-hidden p-6">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tile.gradient} text-white shadow-soft`}><Icon className="h-7 w-7" /></div>
                <p className="mt-5 text-3xl font-bold text-ink-900 dark:text-white">{tile.count}</p>
                <p className="mt-1 text-sm text-ink-500">{tile.label}</p>
                <Link to={tile.href}><Button variant="secondary" size="sm" className="mt-4">Manage <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-900 dark:text-ink-100">Recent activity</h2>
        {activityQuery.isLoading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <LoadingSkeleton key={i} variant="list" />)}</div> :
         activityQuery.isError ? <ErrorState onRetry={() => void activityQuery.refetch()} /> :
         activity.length === 0 ? <p className="text-sm text-ink-500">No recent activity.</p> : (
           <div className="space-y-2">
             {activity.slice(0, 10).map((item, i) => {
               const TypeIcon = typeIcons[item.item_type] ?? FileText;
               return (
                 <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                   <Card className="flex items-center gap-4 p-3">
                     <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300"><TypeIcon className="h-4 w-4" /></div>
                     <div className="min-w-0 flex-1">
                       <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">
                         <span className="capitalize">{item.action}</span> {item.item_type}: <span className="font-semibold">{item.item_name}</span>
                       </p>
                       <p className="text-xs text-ink-400">{formatRelativeTime(item.created_at)}</p>
                     </div>
                     <Badge tone={actionTones[item.action]} className="capitalize">{item.action}</Badge>
                   </Card>
                 </motion.div>
               );
             })}
           </div>
         )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-30">
        <AnimatePresence>
          {fabOpen && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-3 space-y-2">
              <Link to="/teacher/content/topics/new" onClick={() => setFabOpen(false)}>
                <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-card dark:bg-ink-800"><Library className="h-4 w-4 text-brand-500" /><span className="text-sm font-medium text-ink-800 dark:text-ink-100">New topic</span></div>
              </Link>
              <Link to="/teacher/content/lessons/new" onClick={() => setFabOpen(false)}>
                <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-card dark:bg-ink-800"><BookOpen className="h-4 w-4 text-accent-500" /><span className="text-sm font-medium text-ink-800 dark:text-ink-100">New lesson</span></div>
              </Link>
              <Link to="/teacher/content/quizzes/new" onClick={() => setFabOpen(false)}>
                <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-card dark:bg-ink-800"><ClipboardCheck className="h-4 w-4 text-amber-500" /><span className="text-sm font-medium text-ink-800 dark:text-ink-100">New quiz</span></div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="gradient" size="lg" className="shadow-hero" onClick={() => setFabOpen((o) => !o)}>
          {fabOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {fabOpen ? '' : ' Quick add'}
        </Button>
      </div>
    </AppShell>
  );
}
