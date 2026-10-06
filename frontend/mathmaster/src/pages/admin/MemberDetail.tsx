import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Calendar, GraduationCap, Award, Brain } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stat } from '@/components/ui/stat';
import { MemberAvatar } from '@/components/school/MemberAvatar';
import { RoleChip } from '@/components/school/RoleChip';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchMember } from '@/services/schools';
import { mockMemberships } from '@/mocks/schoolMocks';
import { formatRelativeTime } from '@/lib/utils';
import { useSchoolId } from '@/hooks/useSchoolId';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const schoolId = useSchoolId();

  const { data: member, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-member', id],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockMemberships.find((m) => m.id === id) ?? mockMemberships[0]) : fetchMember(schoolId, id!)),
    enabled: !!id,
  });

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError || !member) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load this member." /></AppShell>;

  return (
    <AppShell>
      <Button variant="ghost" onClick={() => navigate('/admin/members')}><ArrowLeft className="h-4 w-4" /> Back to members</Button>
      <Card className="mt-4 flex items-center gap-5 p-6">
        <MemberAvatar name={`${member.user.first_name} ${member.user.last_name}`} role={member.role} className="h-16 w-16" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-ink-900 dark:text-white">{member.user.first_name} {member.user.last_name}</h1>
          <p className="flex items-center gap-1 mt-1 text-sm text-ink-400"><Mail className="h-3.5 w-3.5" />{member.user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <RoleChip role={member.role} />
            <Badge tone={member.is_active ? 'success' : 'danger'}>{member.is_active ? 'Active' : 'Suspended'}</Badge>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Joined" value={formatRelativeTime(member.joined_at)} icon={Calendar} />
        <Stat title="Last active" value={member.last_active_at ? formatRelativeTime(member.last_active_at) : 'Never'} icon={Calendar} />
        {member.class_level && <Stat title="Class" value={`${member.class_level}${member.class_stream ? ` ${member.class_stream}` : ''}`} icon={GraduationCap} />}
        {member.admission_number && <Stat title="Admission #" value={member.admission_number} icon={Award} />}
      </div>

      {member.role === 'student' && (
        <Card className="mt-6 p-6">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Student activity</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-ink-50 p-4 dark:bg-ink-800"><p className="text-xs text-ink-400">Quizzes taken</p><p className="mt-1 text-2xl font-bold text-ink-900 dark:text-white">14</p></div>
            <div className="rounded-xl bg-ink-50 p-4 dark:bg-ink-800"><p className="text-xs text-ink-400">Avg score</p><p className="mt-1 text-2xl font-bold text-emerald-600">82%</p></div>
            <div className="rounded-xl bg-ink-50 p-4 dark:bg-ink-800"><Brain className="h-4 w-4 text-ink-400" /><p className="mt-1 text-xs text-ink-400">AI questions</p><p className="mt-1 text-2xl font-bold text-ink-900 dark:text-white">47</p></div>
          </div>
        </Card>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary">Change role</Button>
        <Button variant="ghost">Suspend</Button>
        <Button variant="ghost" className="text-danger hover:text-danger">Remove from school</Button>
      </div>
    </AppShell>
  );
}