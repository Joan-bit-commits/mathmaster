import * as React from 'react';
import { toast } from 'react-hot-toast';
import { Bell, Shield, Palette, Database, Code } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminSettings() {
  const [digest, setDigest] = React.useState('weekly');
  const [billingAlerts, setBillingAlerts] = React.useState(true);
  const [activityAlerts, setActivityAlerts] = React.useState(false);
  const [require2fa, setRequire2fa] = React.useState(false);

  const handleSave = () => toast.success('Settings saved');

  return (
    <AppShell>
      <PageHeader title="Settings" description="Configure notifications, security, and data preferences." />
      <div className="mt-6 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-brand-500" /><h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Notifications</h3></div>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Email digest frequency</Label>
              <Select value={digest} onValueChange={setDigest}>
                <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3"><Checkbox checked={billingAlerts} onCheckedChange={(v) => setBillingAlerts(v === true)} /><span className="text-sm text-ink-700 dark:text-ink-300">Send billing alerts</span></div>
            <div className="flex items-center gap-3"><Checkbox checked={activityAlerts} onCheckedChange={(v) => setActivityAlerts(v === true)} /><span className="text-sm text-ink-700 dark:text-ink-300">Send member activity alerts</span></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-brand-500" /><h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Security</h3></div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3"><Checkbox checked={require2fa} onCheckedChange={(v) => setRequire2fa(v === true)} /><span className="text-sm text-ink-700 dark:text-ink-300">Require 2FA for all members</span></div>
            <div><Label htmlFor="session">Session timeout (minutes)</Label><Input id="session" type="number" defaultValue={60} className="mt-2 max-w-[120px]" /></div>
            <div><Label htmlFor="ips">Allowed IP ranges (optional)</Label><Input id="ips" placeholder="e.g. 196.0.0.0/8" className="mt-2" /></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2"><Palette className="h-4 w-4 text-brand-500" /><h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Branding</h3></div>
          <p className="mt-2 text-xs text-ink-400">Custom branding is available on School and District plans.</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2"><Database className="h-4 w-4 text-brand-500" /><h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Data</h3></div>
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" size="sm">Export school data</Button>
            <Button variant="ghost" size="sm" className="text-danger hover:text-danger">Delete school</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2"><Code className="h-4 w-4 text-brand-500" /><h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Developer API</h3></div>
          <p className="mt-2 text-xs text-ink-400">Generate API keys for integrations.</p>
          <Button variant="secondary" size="sm" className="mt-4">Generate API key</Button>
        </Card>

        <div className="flex justify-end"><Button variant="primary" onClick={handleSave}>Save settings</Button></div>
      </div>
    </AppShell>
  );
}
