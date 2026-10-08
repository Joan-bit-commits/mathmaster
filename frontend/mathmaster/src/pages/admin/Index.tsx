import * as React from 'react';
import { ActionTile } from '@/components/ui/action-tile';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, Sparkles, Brain, UserPlus, Upload, BookOpen, CreditCard, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { AuditLogRow } from '@/components/school/AuditLogRow';
import { UsageMeter } from '@/components/school/UsageMeter';
import { fetchAuditLogs, fetchUsage, fetchSchool } from '@/services/schools';
import { mockSchool, mockUsage, mockAuditLogs } from '@/mocks/schoolMocks';
import { useSchoolId } from '@/hooks/useSchoolId';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const planLabels: Record<string, string> = { free: 'Free', starter: 'Starter', school: 'School', district: 'District', enterprise: 'Enterprise' };
const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = { active: 'success', trialing: 'warning', past_due: 'warning', suspended: 'danger', archived: 'neutral' };

const onboardingSteps = [
  { label: 'Add school profile', done: true, href: '/admin/school' },
  { label: 'Invite first teacher', done: false, href: '/admin/members/invite' },
  { label: 'Create a class', done: false, href: '/admin/classes' },
  { label: 'Choose a plan', done: true, href: '/admin/billing/plans' },
];

export default function AdminDashboard() {
  const schoolId = useSchoolId();

  const { data: school, isLoading } = useQuery({
    queryKey: ['admin-school', schoolId],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockSchool) : fetchSchool(schoolId)),
    enabled: schoolId != null,
  });

  const { data: usage } = useQuery({
    queryKey: ['admin-usage', schoolId],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockUsage) : fetchUsage(schoolId)),
    enabled: schoolId != null,
  });

  const { data: auditData } = useQuery({
    queryKey: ['admin-audit-recent', schoolId],
    enabled: schoolId != null, queryFn: () => (USE_MOCKS ? Promise.resolve({ count: mockAuditLogs.length, results: mockAuditLogs }) : fetchAuditLogs(schoolId)),
  });

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (!school) return <AppShell><ErrorState message="Could not load school data." /></AppShell>;

  const studentsMetric = usage?.find((u) => u.metric === 'students');
  const teachersMetric = usage?.find((u) => u.metric === 'teachers');
  const aiMetric = usage?.find((u) => u.metric === 'ai_questions');

  return (
    <AppShell>
      {/* Welcome banner */}
      <div className="overflow-hidden rounded-[2rem] bg-ink-900 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{school.name}</p>
            <p className="mt-1.5 text-sm text-ink-300">{school.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone[school.status] ?? 'neutral'}>{school.status}</Badge>
            <Badge tone="brand">{planLabels[school.plan]}</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat title="Students" value={school.student_count} icon={GraduationCap} />
        <Stat title="Teachers" value={school.teacher_count} icon={Users} />
        <Stat title="Active this week" value={18} icon={Sparkles} />
        <Stat title="AI Questions" value={aiMetric?.used ?? 1834} icon={Brain} />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ActionTile icon={UserPlus} title="Invite teachers" description="Send email invitations" to="/admin/members/invite" />
        <ActionTile icon={Upload} title="Import students" description="Bulk CSV upload" to="/admin/members/bulk-import" />
        <ActionTile icon={BookOpen} title="Manage classes" description="Create and assign" to="/admin/classes" />
        <ActionTile icon={CreditCard} title="View billing" description="Plan and invoices" to="/admin/billing" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Recent activity */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Recent activity</h3>
          <div className="mt-4 divide-y divide-ink-100 dark:divide-ink-800">
            {(auditData?.results ?? []).slice(0, 10).map((log) => <AuditLogRow key={log.id} log={log} />)}
          </div>
          <Link to="/admin/audit" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            View all logs <ArrowRight className="h-3 w-3" />
          </Link>
        </Card>

        <div className="space-y-6">
          {/* Onboarding checklist */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Setup checklist</h3>
            <div className="mt-4 space-y-3">
              {onboardingSteps.map((step) => (
                <Link key={step.label} to={step.href} className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-ink-200 text-ink-500 dark:bg-ink-700'}`}>
                      {step.done ? '✓' : '•'}
                    </span>
                    <span className={`text-sm ${step.done ? 'text-ink-400 line-through' : 'text-ink-700 dark:text-ink-300'}`}>{step.label}</span>
                  </div>
                  {!step.done && <ArrowRight className="h-3.5 w-3.5 text-ink-300" />}
                </Link>
              ))}
            </div>
          </Card>

          {/* Usage preview */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Usage</h3>
            <div className="mt-4 space-y-4">
              {(usage ?? []).slice(0, 3).map((metric) => <UsageMeter key={metric.metric} metric={metric} />)}
            </div>
            <Link to="/admin/billing" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              Full usage <ArrowRight className="h-3 w-3" />
            </Link>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}