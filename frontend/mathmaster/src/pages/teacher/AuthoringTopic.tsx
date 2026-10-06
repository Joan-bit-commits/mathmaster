import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { useCreateTopic } from '@/hooks/useTeacher';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea, Label } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  level: z.string().min(1, 'Please select a level'),
  subject: z.string().min(1, 'Please select a subject'),
});

type FormData = z.infer<typeof schema>;
const LEVELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'University'];
const SUBJECTS = ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry', 'Number Theory'];

export default function AuthoringTopic() {
  const navigate = useNavigate();
  const createTopic = useCreateTopic();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: '', description: '', level: '', subject: '' } });
  const level = watch('level');
  const subject = watch('subject');

  const onSubmit = async (data: FormData, addLesson: boolean = false) => {
    try {
      const topic = await createTopic.mutateAsync({ name: data.name, description: data.description, level: data.level as never, subject: data.subject as never, icon: 'BookOpen', color: 'brand', estimated_hours: 5 });
      toast.success('Topic created successfully');
      if (addLesson) navigate(`/teacher/content/lessons/new?topic=${topic.id}`);
      else navigate('/teacher/curriculum');
    } catch { toast.error('Could not create topic'); }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/teacher/content')} className="mb-4"><ArrowLeft className="h-4 w-4" /> Back to content</Button>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">New topic</h1>
        <p className="mt-1 text-sm text-ink-500">Create a new topic for your curriculum.</p>

        <Card className="mt-6 p-6 sm:p-8">
          <form onSubmit={handleSubmit((d) => void onSubmit(d, false))} className="space-y-5">
            <div>
              <Label htmlFor="name">Name <span className="text-danger">*</span></Label>
              <Input id="name" {...register('name')} placeholder="e.g. Linear Equations" className="mt-2" />
              {errors.name && <p className="mt-1.5 text-xs text-danger">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description <span className="text-danger">*</span></Label>
              <Textarea id="description" {...register('description')} placeholder="Describe what students will learn..." className="mt-2 min-h-[100px]" />
              {errors.description && <p className="mt-1.5 text-xs text-danger">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Level <span className="text-danger">*</span></Label>
                <Select value={level} onValueChange={(v) => setValue('level', v, { shouldValidate: true })}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
                {errors.level && <p className="mt-1.5 text-xs text-danger">{errors.level.message}</p>}
              </div>
              <div>
                <Label>Subject <span className="text-danger">*</span></Label>
                <Select value={subject} onValueChange={(v) => setValue('subject', v, { shouldValidate: true })}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                {errors.subject && <p className="mt-1.5 text-xs text-danger">{errors.subject.message}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 pt-5 dark:border-ink-700">
              <Button type="button" variant="ghost" onClick={() => navigate('/teacher/content')}>Cancel</Button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" loading={createTopic.isPending} onClick={handleSubmit((d) => void onSubmit(d, false))}><Save className="h-4 w-4" /> Save</Button>
                <Button type="button" variant="gradient" loading={createTopic.isPending} onClick={handleSubmit((d) => void onSubmit(d, true))}><Plus className="h-4 w-4" /> Save & add lesson</Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
