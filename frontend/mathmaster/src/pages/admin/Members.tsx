import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MemberCard } from '@/components/school/MemberCard';
import { InvitationCard } from '@/components/school/InvitationCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchSchoolMembers, fetchInvitations, revokeInvitation, resendInvitation, removeMember } from '@/services/schools';
import { mockMemberships, mockInvitations } from '@/mocks/schoolMocks';
import { parseApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useSchoolId } from '@/hooks/useSchoolId';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const roleFilters = ['all', 'owner', 'admin', 'teacher', 'student', 'parent'] as const;

export default function Members() {
  const navigate = useNavigate();
  const schoolId = useSchoolId();
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [tab, setTab] = React.useState('active');

  const { data: membersData, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-members', schoolId, roleFilter, search],
    enabled: schoolId != null, queryFn: () => (USE_MOCKS ? Promise.resolve({ count: mockMemberships.length, results: mockMemberships }) : fetchSchoolMembers(schoolId, { role: roleFilter, search })),
  });

  const { data: invitationsData } = useQuery({
    queryKey: ['admin-invitations', schoolId],
    enabled: schoolId != null, queryFn: () => (USE_MOCKS ? Promise.resolve({ count: mockInvitations.length, results: mockInvitations }) : fetchInvitations(schoolId)),
  });

  const handleResend = async (id: string) => {
    try { if (!USE_MOCKS) await resendInvitation(schoolId, id); toast.success('Invitation resent'); } catch (err) { toast.error(parseApiError(err)); }
  };

  const handleRevoke = async (id: string) => {
    try { if (!USE_MOCKS) await revokeInvitation(schoolId, id); toast.success('Invitation revoked'); } catch (err) { toast.error(parseApiError(err)); }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this member from the school?')) return;
    try { if (!USE_MOCKS) await removeMember(schoolId, memberId); toast.success('Member removed'); void refetch(); } catch (err) { toast.error(parseApiError(err)); }
  };

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load members." /></AppShell>;

  return (
    <AppShell>
      <PageHeader title="Members" description="Manage teachers, students, and parents in your school." />
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-ink-400" />
          <Input placeholder="Search by name or email..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="secondary" onClick={() => navigate('/admin/members/bulk-import')}><Upload className="h-4 w-4" /> Bulk import</Button>
        <Button variant="gradient" onClick={() => navigate('/admin/members/invite')}><UserPlus className="h-4 w-4" /> Invite member</Button>
      </div>

      <div className="mt-4 flex gap-2">
        {roleFilters.map((r) => (
          <button key={r} onClick={() => setRoleFilter(r)} className={cn('rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors', roleFilter === r ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-400')}>{r}</button>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="active">Active ({membersData?.count ?? 0})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({invitationsData?.count ?? 0})</TabsTrigger>
          <TabsTrigger value="removed">Removed</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-3">
            {(membersData?.results ?? []).map((m, i) => <MemberCard key={m.id} member={m} index={i} onAction={() => handleRemove(m.id)} />)}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-3">
            {(invitationsData?.results ?? []).map((inv, i) => <InvitationCard key={inv.id} invitation={inv} index={i} onResend={() => handleResend(inv.id)} onRevoke={() => handleRevoke(inv.id)} />)}
            {(invitationsData?.results ?? []).length === 0 && <Card className="p-8 text-center"><p className="text-sm text-ink-500">No pending invitations.</p></Card>}
          </div>
        </TabsContent>

        <TabsContent value="removed">
          <Card className="p-8 text-center"><p className="text-sm text-ink-500">No removed members.</p></Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}