import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlanCard } from '@/components/school/PlanCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchPlans, createCheckoutSession } from '@/services/schools';
import { mockPlans } from '@/mocks/schoolMocks';
import { parseApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useSchoolId } from '@/hooks/useSchoolId';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export default function Plans() {
  const navigate = useNavigate();
  const schoolId = useSchoolId();
  const [cycle, setCycle] = React.useState<'monthly' | 'annual'>('annual');

  const { data: plans, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockPlans) : fetchPlans()),
    enabled: schoolId != null,
  });

  const handleChoose = async (planId: string) => {
    try {
      const res = await createCheckoutSession(schoolId, planId, cycle);
      if (res.url && !USE_MOCKS) window.open(res.url, '_blank');
      else toast.success('Redirecting to checkout...');
    } catch (err) { toast.error(parseApiError(err)); }
  };

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load plans." /></AppShell>;

  return (
    <AppShell>
      <PageHeader title="Plans & Pricing" description="Choose the plan that fits your school." />
      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-xl bg-ink-100 p-1 dark:bg-ink-800">
          {(['monthly', 'annual'] as const).map((c) => (
            <button key={c} onClick={() => setCycle(c)} className={cn('rounded-lg px-4 py-2 text-sm font-medium transition-all capitalize', cycle === c ? 'bg-white text-brand-700 shadow-sm dark:bg-ink-700 dark:text-brand-300' : 'text-ink-500 hover:text-ink-700 dark:text-ink-400')}>
              {c}{c === 'annual' && <span className="ml-1 text-[10px] text-emerald-600">save 2mo</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(plans ?? []).filter((p) => p.id !== 'enterprise').map((plan) => (
          <PlanCard key={plan.id} plan={plan} onChoose={() => handleChoose(plan.id)} />
        ))}
      </div>

      {(plans ?? []).find((p) => p.id === 'enterprise') && (
        <Card className="mt-6 flex flex-col items-center justify-center p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="text-lg font-bold text-ink-900 dark:text-white">Enterprise</h3>
            <p className="mt-1 text-sm text-ink-500">Unlimited everything, on-premise option, custom SLA, and dedicated support.</p>
          </div>
          <Button variant="secondary" className="mt-4 sm:mt-0" onClick={() => window.open('mailto:sales@mathmaster.app', '_blank')}>Contact us</Button>
        </Card>
      )}

      <Card className="mt-8 p-6">
        <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">FAQ</h3>
        <div className="mt-4 space-y-4">
          {[
            { q: 'Can I switch plans anytime?', a: 'Yes. Upgrades take effect immediately. Downgrades take effect at the end of your billing period.' },
            { q: 'Do you offer discounts?', a: 'Annual plans save you 2 months. We also offer district-wide discounts for 3+ schools.' },
            { q: 'What happens when I hit a limit?', a: 'We will notify you before you reach your limit. You can upgrade at any time to avoid disruption.' },
            { q: 'Is there a free trial?', a: 'Yes, all paid plans come with a 14-day free trial. No credit card required.' },
          ].map((faq, i) => (
            <div key={i}>
              <p className="text-sm font-medium text-ink-800 dark:text-ink-200">{faq.q}</p>
              <p className="mt-1 text-xs text-ink-500">{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}