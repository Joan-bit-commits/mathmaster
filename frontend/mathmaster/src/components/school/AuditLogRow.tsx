import { formatRelativeTime } from '@/lib/utils';
import type { AuditLog } from '@/types/school';

const actionLabels: Record<string, string> = {
  'member.invited': 'invited a new member',
  'member.removed': 'removed a member',
  'member.role_changed': 'changed a member role',
  'class.created': 'created a class',
  'plan.upgraded': 'upgraded the plan',
  'quiz.published': 'published a quiz',
  'bulk_import.students': 'bulk imported students',
  'settings.updated': 'updated settings',
  'lesson.created': 'created a lesson',
};

export function AuditLogRow({ log }: { log: AuditLog }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
        {log.actor_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink-700 dark:text-ink-300">
          <span className="font-semibold text-ink-900 dark:text-ink-100">{log.actor_name}</span>{' '}
          {actionLabels[log.action] ?? log.action}
          {log.target && <span className="text-ink-500"> — {log.target}</span>}
        </p>
        <p className="mt-0.5 text-xs text-ink-400">{formatRelativeTime(log.created_at)}</p>
      </div>
    </div>
  );
}
