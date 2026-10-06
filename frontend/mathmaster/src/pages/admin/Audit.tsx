import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Download } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuditLogRow } from '@/components/school/AuditLogRow';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchAuditLogs } from '@/services/schools';
import { mockAuditLogs } from '@/mocks/schoolMocks';
import { useSchoolId } from '@/hooks/useSchoolId';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export default function AdminAudit() {
  const schoolId = useSchoolId();
  const [actionFilter, setActionFilter] = React.useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-audit', schoolId, actionFilter],
    enabled: schoolId != null, queryFn: () => (USE_MOCKS ? Promise.resolve({ count: mockAuditLogs.length, results: mockAuditLogs }) : fetchAuditLogs(schoolId, { action: actionFilter || undefined })),
  });

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load audit logs." /></AppShell>;

  return (
    <AppShell>
      <PageHeader title="Audit Log" description="Track all actions taken in your school." />
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-400" />
          <Select value={actionFilter || 'all'} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="member">Member actions</SelectItem>
              <SelectItem value="class">Class actions</SelectItem>
              <SelectItem value="plan">Plan actions</SelectItem>
              <SelectItem value="settings">Settings actions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1" />
        <Button variant="secondary"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <Card className="mt-6 p-5">
        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {(data?.results ?? []).map((log) => <AuditLogRow key={log.id} log={log} />)}
        </div>
      </Card>
    </AppShell>
  );
}