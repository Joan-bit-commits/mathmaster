import { cn } from "@/lib/utils";
import type { MembershipRole } from "@/types/school";

const styles: Record<MembershipRole, string> = {
  owner: "bg-brand-700 text-white dark:bg-brand-500/30 dark:text-brand-200",
  admin: "bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-300",
  teacher:
    "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  student: "bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-300",
  parent: "bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-300",
};

const labels: Record<MembershipRole, string> = {
  owner: "Owner",
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

export function RoleChip({
  role,
  className,
}: {
  role: MembershipRole;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[role],
        className,
      )}
    >
      {labels[role]}
    </span>
  );
}
