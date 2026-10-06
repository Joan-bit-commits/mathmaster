import { motion } from 'framer-motion';
import { Mail, Clock3, Send, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleChip } from './RoleChip';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Invitation } from '@/types/school';

export function InvitationCard({ invitation, index = 0, onResend, onRevoke }: { invitation: Invitation; index?: number; onResend?: () => void; onRevoke?: () => void }) {
  const expired = new Date(invitation.expires_at) < new Date();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Mail className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-100">{invitation.email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <RoleChip role={invitation.role} />
            {invitation.class_level && <Badge tone="neutral">{invitation.class_level}</Badge>}
            <Badge tone={expired ? 'danger' : 'warning'}>{expired ? 'Expired' : 'Pending'}</Badge>
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-ink-400">
            <Clock3 className="h-3 w-3" />
            {expired ? 'Expired' : `Expires in ${Math.ceil((new Date(invitation.expires_at).getTime() - Date.now()) / 86400000)} days`}
            · Invited by {invitation.invited_by_name}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" onClick={onResend}><Send className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={onRevoke} className="text-danger hover:text-danger"><X className="h-3.5 w-3.5" /></Button>
        </div>
      </Card>
    </motion.div>
  );
}
