import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendInvitations } from '@/services/schools';
import { parseApiError } from '@/lib/api';
import { useSchoolId } from '@/hooks/useSchoolId';

const classLevels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

export default function InviteMember() {
  const navigate = useNavigate();
  const schoolId = useSchoolId();
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('teacher');
  const [classLevel, setClassLevel] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const handleSend = async () => {
    if (!email.trim()) { toast.error('Enter an email address'); return; }
    setSending(true);
    try {
      await sendInvitations(schoolId, [{ email, role, class_level: classLevel || undefined }]);
      toast.success(`Invitation sent to ${email}`);
      navigate('/admin/members');
    } catch (err) { toast.error(parseApiError(err)); }
    setSending(false);
  };

  return (
    <AppShell>
      <Button variant="ghost" onClick={() => navigate('/admin/members')}><ArrowLeft className="h-4 w-4" /> Back to members</Button>
      <PageHeader title="Invite a member" description="Send an email invitation to join your school." />
      <Card className="mt-6 max-w-lg p-6">
        <div className="space-y-4">
          <div><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" placeholder="teacher@school.ac.ug" /></div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {role === 'student' && (
            <div>
              <Label>Class level</Label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classLevels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button variant="gradient" onClick={handleSend} loading={sending} className="w-full"><Send className="h-4 w-4" /> Send invitation</Button>
        </div>
      </Card>
    </AppShell>
  );
}