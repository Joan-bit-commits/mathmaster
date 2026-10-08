import * as React from 'react';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchSchool, updateSchool } from '@/services/schools';
import { mockSchool } from '@/mocks/schoolMocks';
import { parseApiError } from '@/lib/api';
import { useSchoolId } from '@/hooks/useSchoolId';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export default function SchoolProfile() {
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState<{ name: string; address: string; contact_email: string; contact_phone: string; school_type: 'primary' | 'secondary' | 'university' | 'tutoring'; primary_color: string }>({ name: '', address: '', contact_email: '', contact_phone: '', school_type: 'secondary', primary_color: '#006591' });
  const [saving, setSaving] = React.useState(false);

  const { data: school, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-school-profile', schoolId],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockSchool) : fetchSchool(schoolId)),
    enabled: schoolId != null,
  });

  React.useEffect(() => {
    if (school) setForm({ name: school.name, address: school.address, contact_email: school.contact_email, contact_phone: school.contact_phone, school_type: school.school_type, primary_color: school.primary_color });
  }, [school]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!USE_MOCKS) { if (!schoolId) throw new Error('School not loaded'); await updateSchool(schoolId, form); }
      toast.success('School profile updated');
      void queryClient.invalidateQueries({ queryKey: ['admin-school-profile', schoolId] });
    } catch (err) { toast.error(parseApiError(err)); }
    setSaving(false);
  };

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load school profile." /></AppShell>;

  return (
    <AppShell>
      <PageHeader title="School Profile" description="Update your school's information and branding." />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Basic Information</h3>
          <div className="mt-4 space-y-4">
            <div><Label htmlFor="name">School name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" /></div>
            <div><Label htmlFor="address">Address</Label><Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-2" rows={2} /></div>
            <div><Label htmlFor="email">Contact email</Label><Input id="email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="mt-2" /></div>
            <div><Label htmlFor="phone">Contact phone</Label><Input id="phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="mt-2" /></div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Branding</h3>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-xl font-bold text-brand-600 dark:text-brand-400">{form.name.slice(0, 2).toUpperCase()}</div>
                  <Button variant="secondary" size="sm">Upload logo</Button>
                </div>
              </div>
              <div>
                <Label htmlFor="color">Primary color</Label>
                <div className="mt-2 flex items-center gap-3">
                  <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-10 w-12 rounded-lg border border-ink-200 dark:border-ink-700" />
                  <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="max-w-[120px]" />
                </div>
              </div>
              <div>
                <Label>School type</Label>
                <Select value={form.school_type} onValueChange={(v) => setForm({ ...form, school_type: v as 'primary' | 'secondary' | 'university' | 'tutoring' })}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="tutoring">Tutoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="border-rose-200 p-6 dark:border-rose-900/30">
            <h3 className="text-sm font-semibold text-rose-600">Danger Zone</h3>
            <p className="mt-2 text-xs text-ink-400">Archiving a school will suspend all access. This cannot be undone.</p>
            <Button variant="ghost" size="sm" className="mt-4 text-rose-600 hover:text-rose-700">Archive school</Button>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={handleSave} loading={saving}>Save changes</Button>
      </div>
    </AppShell>
  );
}