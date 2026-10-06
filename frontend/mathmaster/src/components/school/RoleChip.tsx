import { cn } from '@/lib/utils';
import type { MembershipRole } from '@/types/school';

const styles: Record<MembershipRole, string> = {
  owner: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  admin: 'bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-300',
  teacher: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  student: 'bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-300',
  parent: 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300',
};

const labels: Record<MembershipRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

export function RoleChip({ role, className }: { role: MembershipRole; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', styles[role], className)}>{labels[role]}</span>;
}
