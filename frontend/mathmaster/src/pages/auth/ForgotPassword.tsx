import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';

export default function ForgotPassword() {
  return (
    <AuthLayout title="Forgot your password?" subtitle="Resetting a password by email isn't available yet.">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-5 dark:border-brand-900/40 dark:bg-brand-900/20">
        <KeyRound className="h-5 w-5 text-brand-500" />
        <p className="mt-3 text-sm leading-6 text-brand-900 dark:text-brand-100">
          If you're locked out, ask your teacher or school administrator for help, or contact the MathMaster team and
          we'll get you back in.
        </p>
      </div>
      <Link to="/login" className="mt-6 block">
        <Button variant="primary" size="lg" className="w-full">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Button>
      </Link>
    </AuthLayout>
  );
}