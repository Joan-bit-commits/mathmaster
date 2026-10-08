import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { parseAuthError } from '@/lib/authErrors';
import { homePathFor } from '@/lib/permissions';

const SHOW_DEMO = import.meta.env.VITE_USE_MOCKS === 'true';

const schema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  // The server decides what a valid password is; only require that something was typed.
  password: z.string().min(1, 'Enter your password'),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [serverError, setServerError] = React.useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  React.useEffect(() => {
    if (isAuthenticated) navigate(from || homePathFor(useAuthStore.getState().user), { replace: true });
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      await login(values.username, values.password);
      toast.success('Welcome back to MathMaster');
      navigate(from || homePathFor(useAuthStore.getState().user), { replace: true });
    } catch (error) {
      setServerError(parseAuthError(error, 'login').message);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your learning journey.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <Label htmlFor="username">Username</Label>
          <div className="relative mt-2">
            <UserRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-400" aria-hidden />
            <Input
              id="username"
              autoComplete="username"
              autoCapitalize="none"
              placeholder="your_username"
              className="pl-10"
              aria-invalid={!!errors.username}
              {...register('username')}
            />
          </div>
          {errors.username && <p className="mt-1.5 text-xs text-danger">{errors.username.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>
          <div className="mt-2">
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>}
        </div>

        <div aria-live="polite">
          {serverError && (
            <div role="alert" className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {serverError}
            </div>
          )}
        </div>

        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500 dark:text-ink-400">
        New to MathMaster?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>

      {SHOW_DEMO && (
        <div className="mt-8 rounded-2xl border border-ink-200 bg-ink-50/80 p-4 dark:border-ink-700 dark:bg-ink-800/50">
          <p className="mb-3 text-xs font-semibold text-ink-700 dark:text-ink-300">Demo accounts (mock mode)</p>
          <div className="flex flex-wrap gap-2">
            {[['Student demo', 'student@demo.com'], ['Teacher demo', 'teacher@demo.com']].map(([label, username]) => (
              <button
                key={username}
                type="button"
                onClick={() => { setValue('username', username); setValue('password', 'password123'); }}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-ink-600 shadow-sm transition-colors hover:bg-brand-50 hover:text-brand-700 dark:bg-ink-700 dark:text-ink-300"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </AuthLayout>
  );
}