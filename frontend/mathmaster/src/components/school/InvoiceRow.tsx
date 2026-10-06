import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Invoice } from '@/types/school';

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  open: 'warning',
  failed: 'danger',
  draft: 'neutral',
};

export function InvoiceRow({ invoice }: { invoice: Invoice }) {
  return (
    <tr className="border-t border-ink-100 transition-colors hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800/50">
      <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-300">{new Date(invoice.period_start).toLocaleDateString()}</td>
      <td className="px-4 py-3 text-sm font-semibold text-ink-900 dark:text-ink-100">{invoice.currency === 'USD' ? '$' : ''}{invoice.amount}</td>
      <td className="px-4 py-3"><Badge tone={statusTone[invoice.status] ?? 'neutral'} className="capitalize">{invoice.status}</Badge></td>
      <td className="px-4 py-3 text-sm text-ink-400">{invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : '—'}</td>
      <td className="px-4 py-3 text-right">
        {invoice.pdf_url && (
          <a href={invoice.pdf_url} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            <Download className="h-3.5 w-3.5" /> PDF
          </a>
        )}
      </td>
    </tr>
  );
}
