import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PlanInfo } from '@/types/school';

export function PlanCard({ plan, current, onChoose, className }: { plan: PlanInfo; current?: boolean; onChoose?: () => void; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cn('', className)}>
      <Card className={cn('relative flex h-full flex-col p-6', plan.popular && 'border-brand-400 shadow-lg dark:border-brand-600')}>
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            <Star className="mr-1 inline h-3 w-3" /> Popular
          </div>
        )}
        <h3 className="text-lg font-bold text-ink-900 dark:text-ink-100">{plan.name}</h3>
        <p className="mt-2 text-3xl font-bold text-ink-900 dark:text-white">
          {plan.price_monthly === 0 ? (plan.id === 'enterprise' ? 'Custom' : 'Free') : `$${plan.price_monthly}`}
          {plan.price_monthly > 0 && <span className="text-sm font-normal text-ink-400">/mo</span>}
        </p>
        {plan.price_annual > 0 && <p className="mt-1 text-xs text-emerald-600">${plan.price_annual}/year (save 2 months)</p>}
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Limits</p>
          {Object.entries(plan.limits).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="capitalize text-ink-500">{key.replace(/_/g, ' ')}</span>
              <span className="font-semibold text-ink-700 dark:text-ink-300">{val === null ? 'Unlimited' : val.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Features</p>
          {Object.entries(plan.features).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              {val === true ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : val === false ? <span className="h-3.5 w-3.5 text-ink-300">—</span> : null}
              <span className={cn('capitalize', val === true ? 'text-ink-700 dark:text-ink-300' : 'text-ink-400')}>{key.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-6">
          {current ? (
            <Button variant="secondary" className="w-full" disabled>Current plan</Button>
          ) : (
            <Button variant={plan.popular ? 'primary' : 'secondary'} className="w-full" onClick={onChoose}>
              {plan.id === 'enterprise' ? 'Contact us' : plan.price_monthly === 0 ? 'Downgrade' : 'Upgrade'}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
