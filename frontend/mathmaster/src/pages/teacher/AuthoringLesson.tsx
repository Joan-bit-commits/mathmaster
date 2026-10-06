import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { useCreateLesson } from '@/hooks/useTeacher';
import { useTopics } from '@/hooks/useLearning';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea, Label } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  order: z.number().min(1, 'Order must be at least 1'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  topic_id: z.string().min(1, 'Please select a topic'),
});

type FormData = z.infer<typeof schema>;

export default function AuthoringLesson() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preselectedTopic = params.get('topic') ?? '';
  const createLesson = useCreateLesson();
  const topicsQuery = useTopics({ page: 1 });
  const topics = topicsQuery.data?.results ?? [];

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { title: '', content: '', order: 1, duration_minutes: 10, topic_id: preselectedTopic },
  });
  const topicId = watch('topic_id');

  const onSubmit = async (data: FormData, addQuiz: boolean = false) => {
    try {
      const lesson = await createLesson.mutateAsync({ topicId: data.topic_id, data: { title: data.title, content: data.content, order: data.order, duration_minutes: data.duration_minutes, topic_id: data.topic_id, description: '', difficulty: 'Beginner' } });
      toast.success('Lesson created successfully');
      if (addQuiz) navigate(`/teacher/content/quizzes/new?lesson=${lesson.id}`);
      else navigate(`/teacher/curriculum/${data.topic_id}`);
    } catch { toast.error('Could not create lesson'); }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/teacher/content')} className="mb-4"><ArrowLeft className="h-4 w-4" /> Back to content</Button>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">New lesson</h1>
        <p className="mt-1 text-sm text-ink-500">Write a lesson with markdown support.</p>

        <Card className="mt-6 p-6 sm:p-8">
          <form onSubmit={handleSubmit((d) => void onSubmit(d, false))} className="space-y-5">
            <div>
              <Label htmlFor="title">Title <span className="text-danger">*</span></Label>
              <Input id="title" {...register('title')} placeholder="e.g. Introduction to Slopes" className="mt-2" />
              {errors.title && <p className="mt-1.5 text-xs text-danger">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="content">Content <span className="text-danger">*</span></Label>
              <Textarea id="content" {...register('content')} placeholder="Write your lesson content in markdown..." className="mt-2 min-h-[200px] font-mono text-sm" />
              {errors.content && <p className="mt-1.5 text-xs text-danger">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Order</Label>
                <Input id="order" type="number" {...register('order')} className="mt-2" />
                {errors.order && <p className="mt-1.5 text-xs text-danger">{errors.order.message}</p>}
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" type="number" {...register('duration_minutes')} className="mt-2" />
                {errors.duration_minutes && <p className="mt-1.5 text-xs text-danger">{errors.duration_minutes.message}</p>}
              </div>
            </div>
            <div>
              <Label>Topic <span className="text-danger">*</span></Label>
              <Select value={topicId} onValueChange={(v) => setValue('topic_id', v, { shouldValidate: true })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent>{topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
              {errors.topic_id && <p className="mt-1.5 text-xs text-danger">{errors.topic_id.message}</p>}
            </div>

            <div className="border-t border-ink-100 pt-5 dark:border-ink-700">
              <Tabs defaultValue="quizzes">
                <TabsList><TabsTrigger value="quizzes">Quizzes</TabsTrigger><TabsTrigger value="resources">Resources</TabsTrigger></TabsList>
                <TabsContent value="quizzes"><p className="py-3 text-sm text-ink-400">Save this lesson, then add quizzes from the quiz authoring page.</p></TabsContent>
                <TabsContent value="resources"><p className="py-3 text-sm text-ink-400">Resource attachments coming soon.</p></TabsContent>
              </Tabs>
            </div>

            <div className="flex items-center justify-between border-t border-ink-100 pt-5 dark:border-ink-700">
              <Button type="button" variant="ghost" onClick={() => navigate('/teacher/content')}>Cancel</Button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" loading={createLesson.isPending} onClick={handleSubmit((d) => void onSubmit(d, false))}><Save className="h-4 w-4" /> Save</Button>
                <Button type="button" variant="gradient" loading={createLesson.isPending} onClick={handleSubmit((d) => void onSubmit(d, true))}><Plus className="h-4 w-4" /> Save & add quiz</Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
