import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardCheck, Clock3, ArrowLeft, Plus, PencilLine, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTopic, useLessons } from '@/hooks/useLearning';
import { useUpdateTopic, useDeleteLesson } from '@/hooks/useTeacher';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { LoadingSkeleton, TopicsGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Stat } from '@/components/ui/stat';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input, Textarea, Label } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LEVELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'University'];
const SUBJECTS = ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry', 'Number Theory'];

export default function TopicDetailTeacher() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const topicQuery = useTopic(topicId);
  const lessonsQuery = useLessons(topicId);
  const topic = topicQuery.data;
  const lessons = lessonsQuery.data ?? [];
  const updateTopic = useUpdateTopic();
  const deleteLesson = useDeleteLesson();

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: '', description: '', level: 'S1' as 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'University', subject: 'Algebra' as 'Algebra' | 'Geometry' | 'Calculus' | 'Statistics' | 'Trigonometry' | 'Number Theory' });

  React.useEffect(() => {
    if (topic) setForm({ name: topic.name, description: topic.description, level: topic.level, subject: topic.subject });
  }, [topic]);

  const handleSave = async () => {
    try {
      await updateTopic.mutateAsync({ id: topicId!, data: form });
      toast.success('Topic updated successfully');
      setEditOpen(false);
    } catch { toast.error('Could not update topic'); }
  };

  const handleDeleteLesson = async () => {
    if (!deleteId) return;
    try {
      await deleteLesson.mutateAsync(deleteId);
      toast.success('Lesson deleted');
      setDeleteId(null);
    } catch { toast.error('Could not delete lesson'); }
  };

  if (topicQuery.isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div><div className="mt-6"><TopicsGridSkeleton /></div></AppShell>;
  if (topicQuery.isError || !topic) return <AppShell><ErrorState onRetry={() => void topicQuery.refetch()} message="We couldn't load this topic." /></AppShell>;

  return (
    <AppShell>
      <Breadcrumb items={[{ label: 'Curriculum', href: '/teacher/curriculum' }, { label: topic.name }]} />
      <Card className="overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">{topic.level}</Badge>
              <Badge tone="neutral">{topic.subject}</Badge>
              <Badge tone={topic.lessons_count > 0 && topic.quizzes_count > 0 ? 'success' : 'warning'}>
                {topic.lessons_count > 0 && topic.quizzes_count > 0 ? 'Ready' : 'Needs attention'}
              </Badge>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">{topic.name}</h1>
            <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-400">{topic.description}</p>
          </div>
          <Button variant="secondary" onClick={() => setEditOpen(true)}><PencilLine className="h-4 w-4" /> Edit topic</Button>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat title="Lessons" value={topic.lessons_count} icon={BookOpen} />
          <Stat title="Quizzes" value={topic.quizzes_count} icon={ClipboardCheck} />
          <Stat title="Est. time" value={`${topic.estimated_hours}h`} icon={Clock3} />
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">Student progress</h2>
          <span className="text-sm font-bold text-brand-600">{topic.progress}%</span>
        </div>
        <Progress value={topic.progress} className="mt-3 h-2.5" />
        <p className="mt-2 text-xs text-ink-500">{topic.lessons_completed} of {topic.lessons_count} lessons completed by students</p>
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-900 dark:text-ink-100">Lessons</h2>
        {lessonsQuery.isLoading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} variant="list" />)}</div> :
         lessons.length === 0 ? <p className="text-sm text-ink-500">No lessons yet. Add one to get started.</p> :
         <div className="space-y-3">
           {lessons.map((lesson, i) => (
             <motion.div key={lesson.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
               <Card className="flex items-center gap-4 p-4">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                   <BookOpen className="h-5 w-5" />
                 </div>
                 <div className="min-w-0 flex-1">
                   <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{lesson.title}</p>
                   <p className="mt-0.5 text-xs text-ink-400">{lesson.duration_minutes} min · {lesson.difficulty} · Order {lesson.order}</p>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/content/lessons/new?topic=${topicId}`)}><Plus className="h-3.5 w-3.5" /> Quiz</Button>
                   <button onClick={() => setDeleteId(lesson.id)} className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20"><Trash2 className="h-4 w-4" /></button>
                 </div>
               </Card>
             </motion.div>
           ))}
         </div>}
      </div>

      <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-3 border-t border-ink-200 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/80">
        <Button variant="ghost" onClick={() => navigate('/teacher/curriculum')}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <Button variant="gradient" onClick={() => navigate(`/teacher/content/lessons/new?topic=${topicId}`)}><Plus className="h-4 w-4" /> Add lesson</Button>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit topic</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label htmlFor="t-name">Name</Label><Input id="t-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-2" /></div>
            <div><Label htmlFor="t-desc">Description</Label><Textarea id="t-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-2" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="t-level">Level</Label><Select value={form.level} onValueChange={(v) => setForm((f) => ({ ...f, level: v as typeof f.level }))}><SelectTrigger id="t-level" className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="t-subject">Subject</Label><Select value={form.subject} onValueChange={(v) => setForm((f) => ({ ...f, subject: v as typeof f.subject }))}><SelectTrigger id="t-subject" className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <Button variant="gradient" loading={updateTopic.isPending} onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete lesson?</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 py-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <p className="text-sm text-ink-500">This action cannot be undone. The lesson and all its content will be permanently removed.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <Button variant="destructive" loading={deleteLesson.isPending} onClick={handleDeleteLesson}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
