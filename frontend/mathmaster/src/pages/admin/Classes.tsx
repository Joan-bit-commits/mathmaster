import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClassCard } from '@/components/school/ClassCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchClasses, createClass } from '@/services/schools';
import { mockClasses } from '@/mocks/schoolMocks';
import { parseApiError } from '@/lib/api';
import { useSchoolId } from '@/hooks/useSchoolId';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const levels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

export default function Classes() {
  const navigate = useNavigate();
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [level, setLevel] = React.useState('S1');
  const [creating, setCreating] = React.useState(false);

  const { data: classes, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-classes', schoolId],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockClasses) : fetchClasses(schoolId)),
    enabled: schoolId != null,
  });

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Enter a class name'); return; }
    setCreating(true);
    try {
      await createClass(schoolId, { name, level });
      toast.success('Class created');
      setShowForm(false);
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['admin-classes', schoolId] });
    } catch (err) { toast.error(parseApiError(err)); }
    setCreating(false);
  };

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load classes." /></AppShell>;

  return (
    <AppShell>
      <PageHeader title="Classes" description="Create and manage classes in your school." />
      <div className="mt-6 flex justify-end">
        <Button variant="gradient" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> New class</Button>
      </div>

      {showForm && (
        <Card className="mt-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="class-name">Class name</Label><Input id="class-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" placeholder="e.g. S3 North" /></div>
            <div>
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>{levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="gradient" onClick={handleCreate} loading={creating}>Create class</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(classes ?? []).map((cls, i) => <ClassCard key={cls.id} cls={cls} index={i} onClick={() => navigate(`/admin/classes/${cls.id}`)} />)}
      </div>
      {(classes ?? []).length === 0 && <Card className="p-8 text-center"><p className="text-sm text-ink-500">No classes yet. Create your first class!</p></Card>}
    </AppShell>
  );
}