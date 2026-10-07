import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { KeyRound, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { joinSchoolByCode } from '@/services/schools';
import { parseApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { homePathFor } from '@/lib/permissions';

export default function JoinSchool() {
  const navigate = useNavigate();
  const [code, setCode] = React.useState('');
  const [joining, setJoining] = React.useState(false);
  const user = useAuthStore((state) => state.user);

  const handleJoin = async () => {
    if (!code.trim()) { toast.error('Enter a class code'); return; }
    setJoining(true);
    try {
      await joinSchoolByCode(code);
      await useAuthStore.getState().refreshProfile(); // pick up the new school + membership
      toast.success('Joined school successfully!');
      navigate(homePathFor(user));
    } catch (err) { toast.error(parseApiError(err)); }
    setJoining(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 dark:bg-ink-900">
      <Card className="max-w-md p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <KeyRound className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-center text-xl font-bold text-ink-900 dark:text-white">Join a school</h1>
        <p className="mt-2 text-center text-sm text-ink-500">Enter the class code provided by your school administrator.</p>
        <div className="mt-6 space-y-4">
          <div><Label htmlFor="code">Class code</Label><Input id="code" value={code} onChange={(e) => setCode(e.target.value)} className="mt-2" placeholder="e.g. KSS-2026-ABC123" /></div>
          <Button variant="gradient" className="w-full" onClick={handleJoin} loading={joining}>Join school <ArrowRight className="ml-2 h-4 w-4" /></Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>Back to login</Button>
        </div>
      </Card>
    </div>
  );
}