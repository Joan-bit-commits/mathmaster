import { motion } from 'framer-motion';
import { MoreVertical, Mail, Clock3 } from 'lucide-react';
import { MemberAvatar } from './MemberAvatar';
import { RoleChip } from './RoleChip';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import type { Membership } from '@/types/school';

export function MemberCard({ member, index = 0, onAction }: { member: Membership; index?: number; onAction?: (action: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card hover className="flex items-center gap-4 p-4">
        <MemberAvatar name={`${member.user.first_name} ${member.user.last_name}`} role={member.role} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">{member.user.first_name} {member.user.last_name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-ink-400"><Mail className="h-3 w-3" />{member.user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <RoleChip role={member.role} />
            {member.class_level && <Badge tone="neutral">{member.class_level}{member.class_stream ? ` ${member.class_stream}` : ''}</Badge>}
          </div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="flex items-center justify-end gap-1 text-xs text-ink-400"><Clock3 className="h-3 w-3" />{member.last_active_at ? formatRelativeTime(member.last_active_at) : 'Never'}</p>
          <p className="mt-1 text-[10px] text-ink-300">Joined {formatRelativeTime(member.joined_at)}</p>
        </div>
        {onAction && (
          <button onClick={() => onAction('menu')} className="rounded-lg p-2 text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700" aria-label="Member actions">
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </Card>
    </motion.div>
  );
}
