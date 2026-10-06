import { Badge } from '@/components/ui/badge';
import type { School } from '@/types/school';

const planTone: Record<string, 'neutral' | 'brand' | 'success' | 'warning' | 'danger'> = {
  free: 'neutral',
  starter: 'brand',
  school: 'success',
  district: 'warning',
  enterprise: 'danger',
};

const planLabels: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  school: 'School',
  district: 'District',
  enterprise: 'Enterprise',
};

export function SchoolBadge({ school, className }: { school: School; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">{school.name}</span>
      <Badge tone={planTone[school.plan] ?? 'neutral'}>{planLabels[school.plan] ?? school.plan}</Badge>
    </div>
  );
}
