import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, Plus, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolStore } from '@/stores/schoolStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
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

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || 'S';

/**
 * The active school, always visible in the sidebar (and the mobile drawer).
 * Shows the school the user last used immediately, and lets them switch between all their schools.
 */
export function SchoolSwitcher({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const school = useSchoolStore((s) => s.currentSchool);
  const membership = useSchoolStore((s) => s.currentMembership);
  const schools = useSchoolStore((s) => s.schools);
  const memberships = useSchoolStore((s) => s.memberships);
  const isLoading = useSchoolStore((s) => s.isLoading);
  const switchSchool = useSchoolStore((s) => s.switchSchool);
  const userRole = useAuthStore((s) => s.user?.role);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!school) {
    if (isLoading) return <div className={cn('animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800', collapsed ? 'mx-auto h-10 w-10' : 'h-14 w-full')} />;
    return (
      <Link
        to="/join-school"
        onClick={onNavigate}
        title="Join a school"
        className={cn(
          'flex items-center gap-3 rounded-xl border border-dashed border-ink-300 px-3 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-ink-600 dark:text-brand-400 dark:hover:bg-ink-800',
          collapsed && 'mx-auto h-10 w-10 justify-center px-0 py-0',
        )}
      >
        <Plus className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Join a school</span>}
      </Link>
    );
  }

  const options = schools.length > 0 ? schools : [school];
  const roleOf = (id: string) => memberships.find((m) => m.school === String(id))?.role;
  const planLine = `${planLabels[school.plan] ?? school.plan}${membership ? ` · ${roleLabels[membership.role]}` : ''}`;

  const handleSwitch = (id: string) => {
    setOpen(false);
    if (String(id) === String(school.id)) return;
    switchSchool(String(id));
    // Everything cached belongs to the previous school.
    void queryClient.invalidateQueries();
    navigate(userRole === 'teacher' ? '/teacher' : '/dashboard');
    onNavigate?.();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={collapsed ? `${school.name} · ${planLine}` : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Switch school"
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-brand-300 dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700',
          collapsed && 'mx-auto h-11 w-11 justify-center border-transparent bg-transparent px-0 py-0',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-xs font-bold text-brand-600 dark:text-brand-400">
          {school.logo_url ? <img src={school.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" /> : initialsOf(school.name)}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">{school.name}</p>
              <p className="truncate text-[11px] text-ink-400">{planLine}</p>
            </div>
            <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-400 transition-transform', open && 'rotate-180')} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={cn(
              'absolute z-50 rounded-2xl border border-ink-200 bg-white p-2 shadow-lg dark:border-ink-700 dark:bg-ink-800',
              collapsed ? 'left-full top-0 ml-3 w-72' : 'left-0 right-0 top-full mt-2',
            )}
          >
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-400">Your schools</p>
            <div className="max-h-64 overflow-y-auto">
              {options.map((s) => {
                const active = String(s.id) === String(school.id);
                const role = roleOf(String(s.id)) ?? s.membership?.role;
                return (
                  <button
                    key={s.id}
                    role="menuitem"
                    onClick={() => handleSwitch(String(s.id))}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      active ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-ink-50 dark:hover:bg-ink-700',
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-bold text-ink-600 dark:bg-ink-700 dark:text-ink-300">
                      {initialsOf(s.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-100">{s.name}</p>
                      <p className="text-[11px] text-ink-400">{role ? roleLabels[role] : planLabels[s.plan] ?? s.plan}</p>
                    </div>
                    {active && <Check className="h-4 w-4 shrink-0 text-brand-500" />}
                  </button>
                );
              })}
            </div>
            <div className="my-1 border-t border-ink-100 dark:border-ink-700" />
            <button role="menuitem" onClick={() => { setOpen(false); onNavigate?.(); navigate('/join-school'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400"><Plus className="h-4 w-4" /></div>
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">Join another school</span>
            </button>
            <button role="menuitem" onClick={() => { setOpen(false); onNavigate?.(); navigate('/onboarding'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Users className="h-4 w-4" /></div>
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">Create new school</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}