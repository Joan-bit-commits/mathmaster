import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, GraduationCap, Users, Award, Brain } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stat } from '@/components/ui/stat';
import { MemberAvatar } from '@/components/school/MemberAvatar';
import { RoleChip } from '@/components/school/RoleChip';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchClasses } from '@/services/schools';
import { mockClasses, mockMemberships } from '@/mocks/schoolMocks';
import { useSchoolId } from '@/hooks/useSchoolId';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const schoolId = useSchoolId();

  const { data: classes, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-classes-detail', schoolId],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockClasses) : fetchClasses(schoolId)),
    enabled: schoolId != null,
  });

  const cls = classes?.find((c) => c.id === id);
  const students = mockMemberships.filter((m) => m.role === 'student' && m.class_level === cls?.level);
  const teachers = mockMemberships.filter((m) => m.role === 'teacher');

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError || !cls) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load this class." /></AppShell>;

  return (
    <AppShell>
      <Button variant="ghost" onClick={() => navigate('/admin/classes')}><ArrowLeft className="h-4 w-4" /> Back to classes</Button>
      <Card className="mt-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400"><GraduationCap className="h-6 w-6" /></div>
          <div><h1 className="text-xl font-bold text-ink-900 dark:text-white">{cls.name}</h1><div className="mt-1 flex items-center gap-2"><Badge tone="neutral">{cls.level}</Badge><Badge tone="brand">Year {cls.academic_year}</Badge></div></div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat title="Students" value={cls.student_count} icon={Users} />
        <Stat title="Avg score" value="78%" icon={Award} />
        <Stat title="Attendance" value="92%" icon={Users} />
        <Stat title="AI questions" value="342" icon={Brain} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Roster ({students.length})</h3>
          <div className="mt-4 space-y-3">
            {students.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <MemberAvatar name={`${s.user.first_name} ${s.user.last_name}`} role="student" className="h-8 w-8" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{s.user.first_name} {s.user.last_name}</p><p className="text-xs text-ink-400">{s.admission_number}</p></div>
                <Badge tone="neutral">{s.class_stream}</Badge>
              </div>
            ))}
            {students.length === 0 && <p className="text-sm text-ink-500">No students in this class yet.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Teachers</h3>
          <div className="mt-4 space-y-3">
            {teachers.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <MemberAvatar name={`${t.user.first_name} ${t.user.last_name}`} role="teacher" className="h-8 w-8" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{t.user.first_name} {t.user.last_name}</p><p className="truncate text-xs text-ink-400">{t.user.email}</p></div>
                <RoleChip role="teacher" />
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" className="mt-4">Assign teacher</Button>
        </Card>
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="secondary">Edit class</Button>
        <Button variant="ghost" className="text-danger hover:text-danger">Archive</Button>
      </div>
    </AppShell>
  );
}