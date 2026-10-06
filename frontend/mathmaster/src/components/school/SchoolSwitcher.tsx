import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, ChevronDown, Plus, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolStore } from '@/stores/schoolStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { MembershipRole } from '@/types/school';

const roleLabels: Record<MembershipRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

const planLabels: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  school: 'School',
  district: 'District',
  enterprise: 'Enterprise',
};

export function SchoolSwitcher() {
  const { currentSchool, currentMembership, memberships, switchSchool } = useSchoolStore();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!currentSchool) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-left transition-colors hover:border-brand-300 dark:border-ink-700 dark:bg-ink-800"
        aria-label="Switch school"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-xs font-semibold text-ink-900 dark:text-ink-100">{currentSchool.name}</p>
          <p className="text-[10px] text-ink-400">{planLabels[currentSchool.plan] ?? currentSchool.plan}{currentMembership ? ` · ${roleLabels[currentMembership.role]}` : ''}</p>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-ink-400 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-ink-200 bg-white p-2 shadow-lg dark:border-ink-700 dark:bg-ink-800"
          >
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-400">Your schools</p>
            {memberships.map((m) => {
              const isActive = m.school === currentSchool.id;
              return (
                <button
                  key={m.id}
                  onClick={() => { switchSchool(m.school); setOpen(false); }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    isActive ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-ink-50 dark:hover:bg-ink-700',
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-bold text-ink-600 dark:bg-ink-700 dark:text-ink-300">
                    {currentSchool.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-100">{currentSchool.name}</p>
                    <Badge tone="neutral" className="mt-0.5 text-[10px]">{roleLabels[m.role]}</Badge>
                  </div>
                  {isActive && <Check className="h-4 w-4 text-brand-500" />}
                </button>
              );
            })}
            <div className="my-1 border-t border-ink-100 dark:border-ink-700" />
            <button onClick={() => { setOpen(false); navigate('/join-school'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400"><Plus className="h-4 w-4" /></div>
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">Join another school</span>
            </button>
            <button onClick={() => { setOpen(false); navigate('/onboarding'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Users className="h-4 w-4" /></div>
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">Create new school</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
