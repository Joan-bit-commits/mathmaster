import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Building2, Palette, UserPlus, CreditCard, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlanCard } from '@/components/school/PlanCard';
import { fetchPlans, createCheckoutSession } from '@/services/schools';
import { useQuery } from '@tanstack/react-query';
import { mockPlans } from '@/mocks/schoolMocks';
import { cn } from '@/lib/utils';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const steps = ['Profile', 'Branding', 'Invite', 'Plan', 'Done'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({ name: '', address: '', school_type: 'secondary', primary_color: '#006591', teacher_email: '', teacher_name: '' });
  const [selectedPlan, setSelectedPlan] = React.useState<string>('school');

  const { data: plans } = useQuery({ queryKey: ['onboarding-plans'], queryFn: () => (USE_MOCKS ? Promise.resolve(mockPlans) : fetchPlans()) });

  React.useEffect(() => {
    const saved = localStorage.getItem('onboarding-draft');
    if (saved) { try { setForm(JSON.parse(saved)); } catch { /* skip */ } }
  }, []);

  React.useEffect(() => { localStorage.setItem('onboarding-draft', JSON.stringify(form)); }, [form]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    localStorage.removeItem('onboarding-draft');
    toast.success('School created successfully!');
    navigate('/admin');
  };

  const handleChoosePlan = async (planId: string) => {
    setSelectedPlan(planId);
    if (planId !== 'free') {
      try { const res = await createCheckoutSession('school-1', planId, 'annual'); if (res.url && !USE_MOCKS) window.open(res.url, '_blank'); } catch { /* skip */ }
    }
    next();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Set up your school</h1>
        <p className="mt-1 text-sm text-ink-500">Complete these steps to get your school ready.</p>

        {/* Progress indicator */}
        <div className="mt-8 flex items-center justify-between">
          {steps.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all', i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-500 text-white' : 'bg-ink-200 text-ink-400 dark:bg-ink-700')}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn('mt-1.5 text-[10px] font-medium', i <= step ? 'text-ink-700 dark:text-ink-300' : 'text-ink-400')}>{label}</span>
              </div>
              {i < steps.length - 1 && <div className={cn('mx-1 h-0.5 flex-1 rounded-full', i < step ? 'bg-emerald-500' : 'bg-ink-200 dark:bg-ink-700')} />}
            </React.Fragment>
          ))}
        </div>

        <Card className="mt-8 p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-brand-500" /><h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">School profile</h2></div>
                <div className="space-y-4">
                  <div><Label htmlFor="onb-name">School name</Label><Input id="onb-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" placeholder="e.g. Kampala Secondary School" /></div>
                  <div><Label htmlFor="onb-addr">Address</Label><Input id="onb-addr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-2" placeholder="Plot 12, Kira Road, Kampala" /></div>
                  <div><Label>School type</Label><Select value={form.school_type} onValueChange={(v) => setForm({ ...form, school_type: v })}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="primary">Primary</SelectItem><SelectItem value="secondary">Secondary</SelectItem><SelectItem value="university">University</SelectItem><SelectItem value="tutoring">Tutoring</SelectItem></SelectContent></Select></div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="branding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-4 flex items-center gap-2"><Palette className="h-5 w-5 text-brand-500" /><h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">Branding</h2></div>
                <div className="space-y-4">
                  <div>
                    <Label>Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-xl font-bold text-brand-600 dark:text-brand-400">{form.name.slice(0, 2).toUpperCase() || 'SC'}</div>
                      <Button variant="secondary" size="sm">Upload logo</Button>
                    </div>
                  </div>
                  <div><Label htmlFor="onb-color">Primary color</Label><div className="mt-2 flex items-center gap-3"><input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-10 w-12 rounded-lg border border-ink-200 dark:border-ink-700" /><Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="max-w-[120px]" /></div></div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="invite" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-4 flex items-center gap-2"><UserPlus className="h-5 w-5 text-brand-500" /><h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">Invite first teacher</h2></div>
                <div className="space-y-4">
                  <div><Label htmlFor="onb-tname">Teacher name</Label><Input id="onb-tname" value={form.teacher_name} onChange={(e) => setForm({ ...form, teacher_name: e.target.value })} className="mt-2" placeholder="John Okello" /></div>
                  <div><Label htmlFor="onb-temail">Teacher email</Label><Input id="onb-temail" type="email" value={form.teacher_email} onChange={(e) => setForm({ ...form, teacher_email: e.target.value })} className="mt-2" placeholder="teacher@school.ac.ug" /></div>
                  <p className="text-xs text-ink-400">You can skip this step and invite teachers later.</p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-brand-500" /><h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">Choose a plan</h2></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(plans ?? []).filter((p) => p.id !== 'enterprise').map((plan) => <PlanCard key={plan.id} plan={plan} onChoose={() => handleChoosePlan(plan.id)} />)}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="flex flex-col items-center text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-8 w-8" />
                  </motion.div>
                  <h2 className="mt-6 text-xl font-bold text-ink-900 dark:text-white">All set!</h2>
                  <p className="mt-2 text-sm text-ink-500">Your school is ready. You can now invite members, create classes, and start teaching.</p>
                  <Button variant="gradient" className="mt-6" onClick={finish}>Go to dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 4 && (
            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={back} disabled={step === 0}><ArrowLeft className="h-4 w-4" /> Back</Button>
              {step < 3 && <Button variant="gradient" onClick={next}>Continue <ArrowRight className="h-4 w-4" /></Button>}
              {step === 3 && <Button variant="ghost" onClick={next}>Skip for now</Button>}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
