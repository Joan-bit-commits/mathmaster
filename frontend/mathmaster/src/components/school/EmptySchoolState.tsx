import { Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function EmptySchoolState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Building2 className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-ink-900 dark:text-white">Welcome to MathMaster</h2>
        <p className="mt-2 text-sm text-ink-500">You're not part of any school yet. Create one to get started, or join an existing school with a class code.</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link to="/onboarding"><Button variant="gradient" className="w-full">Create a new school <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          <Link to="/join-school"><Button variant="secondary" className="w-full">Join with a class code</Button></Link>
        </div>
      </Card>
    </div>
  );
}
