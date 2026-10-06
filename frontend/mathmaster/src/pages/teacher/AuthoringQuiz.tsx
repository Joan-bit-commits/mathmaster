import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { useCreateQuiz } from '@/hooks/useTeacher';
import { useLessons, useTopics } from '@/hooks/useLearning';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea, Label } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  lesson_id: z.string().min(1, 'Please select a lesson'),
});

type FormData = z.infer<typeof schema>;

export default function AuthoringQuiz() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preselectedLesson = params.get('lesson') ?? '';
  const createQuiz = useCreateQuiz();
  const [topicForLessons, setTopicForLessons] = React.useState('');
  const topicsQuery = useTopics({ page: 1 });
  const lessonsQuery = useLessons(topicForLessons || undefined);
  const topics = topicsQuery.data?.results ?? [];
  const lessons = lessonsQuery.data ?? [];

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', lesson_id: preselectedLesson },
  });
  const lessonId = watch('lesson_id');

  const onSubmit = async (data: FormData, addQuestion: boolean = false) => {
    try {
      const quiz = await createQuiz.mutateAsync({ lessonId: data.lesson_id, data: { title: data.title, description: data.description, lesson_id: data.lesson_id } });
      toast.success('Quiz created successfully');
      if (addQuestion) navigate(`/teacher/content/questions/new?quiz=${quiz.id}`);
      else navigate(`/lessons/${data.lesson_id}/quizzes`);
    } catch { toast.error('Could not create quiz'); }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/teacher/content')} className="mb-4"><ArrowLeft className="h-4 w-4" /> Back to content</Button>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">New quiz</h1>
        <p className="mt-1 text-sm text-ink-500">Create a quiz for a lesson.</p>

        <Card className="mt-6 p-6 sm:p-8">
          <form onSubmit={handleSubmit((d) => void onSubmit(d, false))} className="space-y-5">
            <div>
              <Label htmlFor="title">Title <span className="text-danger">*</span></Label>
              <Input id="title" {...register('title')} placeholder="e.g. Linear Equations Quiz" className="mt-2" />
              {errors.title && <p className="mt-1.5 text-xs text-danger">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description <span className="text-danger">*</span></Label>
              <Textarea id="description" {...register('description')} placeholder="Describe what this quiz covers..." className="mt-2 min-h-[80px]" />
              {errors.description && <p className="mt-1.5 text-xs text-danger">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Topic (to filter lessons)</Label>
                <Select value={topicForLessons} onValueChange={setTopicForLessons}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select topic" /></SelectTrigger>
                  <SelectContent>{topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lesson <span className="text-danger">*</span></Label>
                <Select value={lessonId} onValueChange={(v) => setValue('lesson_id', v, { shouldValidate: true })}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select lesson" /></SelectTrigger>
                  <SelectContent>{lessons.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent>
                </Select>
                {errors.lesson_id && <p className="mt-1.5 text-xs text-danger">{errors.lesson_id.message}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 pt-5 dark:border-ink-700">
              <Button type="button" variant="ghost" onClick={() => navigate('/teacher/content')}>Cancel</Button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" loading={createQuiz.isPending} onClick={handleSubmit((d) => void onSubmit(d, false))}><Save className="h-4 w-4" /> Save</Button>
                <Button type="button" variant="gradient" loading={createQuiz.isPending} onClick={handleSubmit((d) => void onSubmit(d, true))}><Plus className="h-4 w-4" /> Save & add question</Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
