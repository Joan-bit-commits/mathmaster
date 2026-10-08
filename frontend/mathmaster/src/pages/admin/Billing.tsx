import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowRight, CreditCard, ExternalLink } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UsageMeter } from '@/components/school/UsageMeter';
import { InvoiceRow } from '@/components/school/InvoiceRow';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchSubscription, fetchUsage, fetchInvoices, openBillingPortal, cancelSubscription } from '@/services/schools';
import { mockSubscription, mockUsage, mockInvoices } from '@/mocks/schoolMocks';
import { parseApiError } from '@/lib/api';
import { useSchoolId } from '@/hooks/useSchoolId';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const planLabels: Record<string, string> = { free: 'Free', starter: 'Starter', school: 'School', district: 'District', enterprise: 'Enterprise' };

export default function Billing() {
  const navigate = useNavigate();
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({ queryKey: ['admin-subscription', schoolId], enabled: schoolId != null, queryFn: () => (USE_MOCKS ? Promise.resolve(mockSubscription) : fetchSubscription(schoolId)) });
  const { data: usage } = useQuery({ queryKey: ['admin-usage-billing', schoolId], enabled: schoolId != null, queryFn: () => (USE_MOCKS ? Promise.resolve(mockUsage) : fetchUsage(schoolId)) });
  const { data: invoices } = useQuery({ queryKey: ['admin-invoices', schoolId], enabled: schoolId != null, queryFn: () => (USE_MOCKS ? Promise.resolve(mockInvoices) : fetchInvoices(schoolId)) });

  const handlePortal = async () => {
    try { const res = await openBillingPortal(schoolId); if (res.url && !USE_MOCKS) window.open(res.url, '_blank'); else toast.success('Opening billing portal...'); } catch (err) { toast.error(parseApiError(err)); }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? You will lose access at the end of the billing period.')) return;
    try { await cancelSubscription(schoolId); toast.success('Subscription canceled'); void queryClient.invalidateQueries({ queryKey: ['admin-subscription', schoolId] }); } catch (err) { toast.error(parseApiError(err)); }
  };

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (!subscription) return <AppShell><ErrorState message="Could not load billing information." /></AppShell>;

  return (
    <AppShell>
      <PageHeader title="Billing" description="Manage your subscription, usage, and invoices." />

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Current plan</p>
                <p className="mt-1 text-2xl font-bold text-ink-900 dark:text-white">{planLabels[subscription.plan]}</p>
                <p className="mt-1 text-sm text-ink-500">{subscription.currency === 'USD' ? '$' : ''}{subscription.amount}/{subscription.billing_cycle}</p>
              </div>
              <Badge tone={subscription.status === 'active' ? 'success' : 'warning'} className="capitalize">{subscription.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div><p className="text-xs text-ink-400">Next billing date</p><p className="mt-1 text-sm font-medium text-ink-700 dark:text-ink-300">{new Date(subscription.current_period_end).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-ink-400">Payment method</p><p className="mt-1 text-sm font-medium text-ink-700 dark:text-ink-300">•••• {subscription.payment_method_last4 ?? '—'}</p></div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="primary" onClick={() => navigate('/admin/billing/plans')}>Upgrade plan <ArrowRight className="h-4 w-4" /></Button>
              <Button variant="secondary" onClick={handlePortal}><CreditCard className="h-4 w-4" /> Manage payment</Button>
              <Button variant="ghost" className="text-danger hover:text-danger" onClick={handleCancel}>Cancel subscription</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Usage</h3>
            <div className="mt-4 space-y-5">
              {(usage ?? []).map((metric) => <UsageMeter key={metric.metric} metric={metric} />)}
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="p-5"><h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Invoices</h3></div>
            <table className="w-full">
              <thead className="bg-ink-50 dark:bg-ink-800/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-ink-400">Period</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-ink-400">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-ink-400">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-ink-400">Paid</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-ink-400"></th>
                </tr>
              </thead>
              <tbody>{(invoices ?? []).map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)}</tbody>
            </table>
          </Card>
        </div>

        <Card className="h-fit p-6">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Need help?</h3>
          <p className="mt-2 text-xs text-ink-400">Questions about your subscription or need a custom plan? Contact our team.</p>
          <Button variant="secondary" className="mt-4 w-full" onClick={() => window.open('mailto:sales@mathmaster.app', '_blank')}><ExternalLink className="h-4 w-4" /> Contact sales</Button>
        </Card>
      </div>
    </AppShell>
  );
}