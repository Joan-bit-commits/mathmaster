import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { MembershipRole } from '@/types/school';

const ringColors: Record<MembershipRole, string> = {
  owner: 'ring-2 ring-brand-600',
  admin: 'ring-2 ring-brand-400',
  teacher: 'ring-2 ring-brand-300',
  student: 'ring-2 ring-ink-300',
  parent: 'ring-2 ring-ink-300',
};

export function MemberAvatar({ name, role, className }: { name: string; role: MembershipRole; className?: string }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <Avatar className={cn(ringColors[role], className)}>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}