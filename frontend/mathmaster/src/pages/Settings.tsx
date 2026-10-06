import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Download, Moon, Sun, Monitor, Trash2, FileText, Shield, Palette, LogOut, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return <button onClick={onChange} className={cn('relative h-6 w-11 rounded-full transition-colors', checked ? 'bg-brand-500' : 'bg-ink-200 dark:bg-ink-600')}><span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} /></button>;
}

export default function Settings() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useThemeStore();
  const [push, setPush] = React.useState(true);
  const [emailNotif, setEmailNotif] = React.useState(true);
  const [dailyQuiz, setDailyQuiz] = React.useState(false);
  const [clearCacheOpen, setClearCacheOpen] = React.useState(false);
  const [signOutOpen, setSignOutOpen] = React.useState(false);
  const [versionOpen, setVersionOpen] = React.useState(false);

  const handleSignOut = async () => { await logout(); navigate('/login'); };
  const themes: { key: 'light' | 'dark' | 'system'; label: string; icon: React.ElementType }[] = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your preferences and account.</p>

        {/* Notifications */}
        <Card className="mt-6 p-6">
          <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">Notifications</h2>
          <div className="mt-4 space-y-1">
            {[
              { label: 'Push notifications', desc: 'Receive push alerts on your device', value: push, setter: setPush },
              { label: 'Email notifications', desc: 'Get updates via email', value: emailNotif, setter: setEmailNotif },
              { label: 'Daily quiz reminder', desc: 'Remind me to practice daily', value: dailyQuiz, setter: setDailyQuiz },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300"><Bell className="h-4 w-4" /></div>
                    <div><p className="text-sm font-medium text-ink-800 dark:text-ink-100">{item.label}</p><p className="text-xs text-ink-400">{item.desc}</p></div>
                  </div>
                  <Toggle checked={item.value} onChange={() => item.setter((v: boolean) => !v)} />
                </div>
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* Appearance */}
        <Card className="mt-6 p-6">
          <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">Appearance</h2>
          <p className="mt-1 text-sm text-ink-400">Choose your preferred theme</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => { setTheme(t.key); toast.success(`Theme: ${t.label}`); }} className={cn('flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all', theme === t.key ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-ink-200 hover:border-brand-200 dark:border-ink-600')}>
                  <Icon className={cn('h-5 w-5', theme === t.key ? 'text-brand-500' : 'text-ink-400')} />
                  <span className={cn('text-sm font-medium', theme === t.key ? 'text-brand-700 dark:text-brand-300' : 'text-ink-500')}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Data */}
        <Card className="mt-6 p-6">
          <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">Data</h2>
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300"><Download className="h-4 w-4" /></div>
                <div><p className="text-sm font-medium text-ink-800 dark:text-ink-100">Download lessons for offline</p><p className="text-xs text-ink-400">Access without internet</p></div>
              </div>
              <Badge tone="brand">12 available</Badge>
            </div>
            <Separator />
            <button onClick={() => setClearCacheOpen(true)} className="flex w-full items-center justify-between py-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500 dark:bg-rose-900/30"><Trash2 className="h-4 w-4" /></div>
                <div><p className="text-sm font-medium text-rose-600">Clear cache</p><p className="text-xs text-ink-400">Free up storage space</p></div>
              </div>
            </button>
          </div>
        </Card>

        {/* About */}
        <Card className="mt-6 p-6">
          <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">About</h2>
          <div className="mt-4 space-y-1">
            {[
              { icon: FileText, label: 'Terms of Service' },
              { icon: Shield, label: 'Privacy Policy' },
              { icon: Palette, label: 'Open source licenses' },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <Separator />}
                <button className="flex w-full items-center gap-3 py-3 text-left">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300"><item.icon className="h-4 w-4" /></div>
                  <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{item.label}</p>
                </button>
              </React.Fragment>
            ))}
            <Separator />
            <button onClick={() => setVersionOpen(true)} className="flex w-full items-center justify-between py-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300"><Palette className="h-4 w-4" /></div>
                <p className="text-sm font-medium text-ink-800 dark:text-ink-100">Version</p>
              </div>
              <span className="text-sm text-ink-400">1.0.0 (build 12)</span>
            </button>
          </div>
        </Card>

        <Button variant="destructive" className="mt-6 w-full" onClick={() => setSignOutOpen(true)}><LogOut className="h-4 w-4" /> Sign out</Button>

        {/* Clear cache dialog */}
        <Dialog open={clearCacheOpen} onOpenChange={setClearCacheOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Clear cache?</DialogTitle></DialogHeader>
            <div className="flex items-start gap-3 py-2"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" /><p className="text-sm text-ink-500">This will remove downloaded lesson data. Your progress will not be affected.</p></div>
            <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button variant="destructive" onClick={() => { toast.success('Cache cleared'); setClearCacheOpen(false); }}>Clear</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sign out dialog */}
        <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Sign out?</DialogTitle></DialogHeader>
            <p className="text-sm text-ink-500">You'll need to sign in again to continue.</p>
            <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button variant="destructive" onClick={handleSignOut}><LogOut className="h-4 w-4" /> Sign out</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Version dialog */}
        <Dialog open={versionOpen} onOpenChange={setVersionOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>App version</DialogTitle></DialogHeader>
            <div className="space-y-2 py-2 text-sm text-ink-500">
              <div className="flex justify-between"><span>Version</span><span className="font-medium text-ink-800 dark:text-ink-100">1.0.0</span></div>
              <div className="flex justify-between"><span>Build</span><span className="font-medium text-ink-800 dark:text-ink-100">12</span></div>
              <div className="flex justify-between"><span>Released</span><span className="font-medium text-ink-800 dark:text-ink-100">Sept 2026</span></div>
              <div className="flex justify-between"><span>Framework</span><span className="font-medium text-ink-800 dark:text-ink-100">React 18 + Vite</span></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
