import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, SlidersHorizontal, Users, TrendingUp, Activity } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { useTeacherStudents, useTeacherOverview } from '@/hooks/useTeacher';
import { useDebounce } from '@/hooks/useDebounce';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stat } from '@/components/ui/stat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { PageHeader } from '@/components/ui/page-header';
import { formatRelativeTime } from '@/lib/utils';

export default function Students() {
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState('Last active');
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();

  const overviewQuery = useTeacherOverview();
  const studentsQuery = useTeacherStudents({ search: debouncedSearch, sort, page });
  const students = studentsQuery.data?.results ?? [];
  const hasMore = studentsQuery.data?.hasMore ?? false;
  const ov = overviewQuery.data;

  return (
    <AppShell>
      <PageHeader title="Students" description="Track progress and engagement across your classes." />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat title="Total students" value={ov?.students_count ?? 0} icon={Users} />
        <Stat title="Active this week" value={ov?.active_students_7d ?? 0} icon={Activity} trend={{ value: `+${ov?.new_students_this_week ?? 0}`, direction: 'up' }} />
        <Stat title="Average score" value="74%" icon={TrendingUp} />
      </div>

      <div className="sticky top-16 z-20 -mx-4 mt-6 border-b border-ink-200 bg-ink-50/80 px-4 py-3 backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/80 sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search students..." className="pl-10" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 rounded p-1 text-ink-400 hover:text-ink-700"><X className="h-4 w-4" /></button>}
          </div>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="sm:w-44"><SlidersHorizontal className="mr-2 h-4 w-4 text-ink-400" /><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Last active">Last active</SelectItem><SelectItem value="Name">Name</SelectItem><SelectItem value="Average score">Average score</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {studentsQuery.isLoading ? <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} variant="list" />)}</div> :
         studentsQuery.isError ? <ErrorState onRetry={() => void studentsQuery.refetch()} /> :
         students.length === 0 ? (
           <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-300 bg-white p-12 text-center dark:border-ink-600 dark:bg-ink-800">
             <Search className="h-10 w-10 text-ink-300" />
             <h3 className="mt-4 text-base font-semibold text-ink-900 dark:text-ink-100">No students found</h3>
             <p className="mt-1 text-sm text-ink-500">Try adjusting your search.</p>
           </div>
         ) : (
           <>
             <div className="space-y-3">
               {students.map((student, i) => (
                 <motion.div key={student.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                   <button onClick={() => navigate(`/teacher/students/${student.id}`)} className="w-full text-left">
                     <div className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-soft dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700">
                       <Avatar className="h-12 w-12"><AvatarFallback>{student.first_name[0]}</AvatarFallback></Avatar>
                       <div className="min-w-0 flex-1">
                         <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">{student.first_name}</p>
                         <p className="text-xs text-ink-400">@{student.username} · {student.email}</p>
                       </div>
                       <Badge tone="brand">{student.level}</Badge>
                       <div className="hidden text-right sm:block">
                         <p className="text-xs text-ink-400">Last active</p>
                         <p className="text-sm font-medium text-ink-600 dark:text-ink-300">{formatRelativeTime(student.last_active)}</p>
                       </div>
                       <div className="hidden h-10 w-24 lg:block">
                         <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={student.activity}>
                             <Line type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={2} dot={false} />
                           </LineChart>
                         </ResponsiveContainer>
                       </div>
                       <div className="flex items-center gap-2">
                         <Badge tone={student.avg_score >= 75 ? 'success' : student.avg_score >= 50 ? 'brand' : 'warning'}>{student.avg_score}%</Badge>
                         <Button variant="ghost" size="sm">View</Button>
                       </div>
                     </div>
                   </button>
                 </motion.div>
               ))}
             </div>
             {hasMore && <div className="mt-6 flex justify-center"><Button variant="secondary" onClick={() => setPage((p) => p + 1)}>Load more</Button></div>}
           </>
         )}
      </div>
    </AppShell>
  );
}
