import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { Bell, ChevronRight, Download, Globe, HelpCircle, LogOut, Mail, Moon, Palette, Shield, Target, UserCog, FileText, LockKeyhole, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input, Label } from '@/components/ui/input';


type MenuItem = { icon: React.ElementType; label: string; sublabel?: string; onClick?: () => void };
type MenuGroup = { title: string; items: MenuItem[] };

export default function StudentProfile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = React.useState(false);
  const [signOutOpen, setSignOutOpen] = React.useState(false);
  const [firstName, setFirstName] = React.useState(user?.first_name ?? '');
  const [username, setUsername] = React.useState(user?.username ?? '');
  const initials = user?.first_name?.[0]?.toUpperCase() ?? 'M';

  const handleSignOut = async () => { await logout(); navigate('/login'); };
  const handleSaveProfile = () => { toast.success('Profile updated successfully'); setEditOpen(false); };

  const groups: MenuGroup[] = [
    { title: 'Account', items: [
      { icon: UserCog, label: 'Edit profile', onClick: () => setEditOpen(true) },
      { icon: LockKeyhole, label: 'Change password' },
      { icon: Mail, label: 'Email preferences' },
    ]},
    { title: 'Learning', items: [
      { icon: Target, label: 'Goals' },
      { icon: Bell, label: 'Reminder times' },
      { icon: Bell, label: 'Daily quiz reminder', sublabel: 'Toggle on/off' },
    ]},
    { title: 'App', items: [
      { icon: Bell, label: 'Notifications' },
      { icon: Globe, label: 'Language' },
      { icon: Moon, label: 'Theme' },
      { icon: Download, label: 'Offline downloads' },
    ]},
    { title: 'Support', items: [
      { icon: HelpCircle, label: 'Help center' },
      { icon: MessageSquare, label: 'Contact support' },
      { icon: AlertTriangle, label: 'Report a problem' },
    ]},
    { title: 'About', items: [
      { icon: FileText, label: 'Terms of Service' },
      { icon: Shield, label: 'Privacy Policy' },
      { icon: Palette, label: 'Version', sublabel: '1.0.0' },
    ]},
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        {/* Profile header */}
        <Card className="rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24 text-3xl"><AvatarFallback className="text-3xl">{initials}</AvatarFallback></Avatar>
              <button onClick={() => setEditOpen(true)} className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft transition-transform hover:scale-110"><UserCog className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-ink-900 dark:text-white">{user?.first_name ?? 'Learner'}</h1>
              <p className="mt-1 text-sm text-ink-500">{user?.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge tone="brand">Student</Badge>
                <Badge tone="neutral">S1</Badge>
                <Badge tone="accent">@{user?.username ?? 'learner'}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit profile dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div><Label htmlFor="edit-name">First name</Label><Input id="edit-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-2" /></div>
              <div><Label htmlFor="edit-username">Username</Label><Input id="edit-username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2" /></div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
              <Button variant="gradient" onClick={handleSaveProfile}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Menu groups */}
        <div className="mt-6 space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-400">{group.title}</p>
              <Card className="overflow-hidden p-0">
                {group.items.map((item, i) => (
                  <React.Fragment key={`${group.title}-${item.label}`}>
                    {i > 0 && <Separator />}
                    <button onClick={item.onClick} className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-700/50">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300"><item.icon className="h-4 w-4" /></div>
                      <div className="flex-1"><p className="text-sm font-medium text-ink-800 dark:text-ink-100">{item.label}</p>{item.sublabel && <p className="mt-0.5 text-xs text-ink-400">{item.sublabel}</p>}</div>
                      <ChevronRight className="h-4 w-4 text-ink-300" />
                    </button>
                  </React.Fragment>
                ))}
              </Card>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Sign out?</DialogTitle></DialogHeader>
            <p className="text-sm text-ink-500">You'll need to sign in again to continue learning.</p>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
              <Button variant="destructive" onClick={handleSignOut}><LogOut className="h-4 w-4" /> Sign out</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="destructive" className="mt-6 w-full" onClick={() => setSignOutOpen(true)}><LogOut className="h-4 w-4" /> Sign out</Button>
      </div>
    </AppShell>
  );
}
