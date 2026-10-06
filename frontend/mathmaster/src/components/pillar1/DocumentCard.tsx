import { FileText, MoreVertical, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { DocumentItem } from '@/types/pillar1';

const statusConfig: Record<string, { label: string; tone: 'brand' | 'success' | 'warning' | 'danger' }> = {
  ready: { label: 'Ready', tone: 'success' },
  processing: { label: 'Processing', tone: 'warning' },
  pending: { label: 'Pending', tone: 'brand' },
  failed: { label: 'Failed', tone: 'danger' },
};

const typeLabels: Record<string, string> = {
  textbook: 'Textbook',
  past_paper: 'Past paper',
  notes: 'Notes',
  worksheet: 'Worksheet',
  other: 'Other',
};

export function DocumentCard({
  doc,
  index = 0,
  onClick,
  onDelete,
}: {
  doc: DocumentItem;
  index?: number;
  onClick?: () => void;
  onDelete?: () => void;
}) {
  const status = statusConfig[doc.processing_status] ?? statusConfig.pending;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card hover className="group cursor-pointer p-5" onClick={onClick}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">{doc.title}</h3>
              <p className="mt-0.5 text-xs text-ink-400">{doc.page_count} pages</p>
            </div>
          </div>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="rounded-lg p-1.5 text-ink-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-rose-500/10"
              aria-label="Delete document"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Badge tone="neutral">{typeLabels[doc.document_type] ?? doc.document_type}</Badge>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </Card>
    </motion.div>
  );
}
