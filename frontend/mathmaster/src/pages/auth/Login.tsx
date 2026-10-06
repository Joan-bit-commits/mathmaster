import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const schema = z.object({ username: z.string().min(1, 'Enter your username'), password: z.string().min(6, 'Password must be at least 6 characters'), remember: z.boolean().optional() });
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState('');
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { remember: true } });

  React.useEffect(() => { if (isAuthenticated) { const user = useAuthStore.getState().user; navigate(user?.role === 'teacher' ? '/teacher' : '/dashboard', { replace: true }); } }, [isAuthenticated, navigate]);

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try { await login(values.username, values.password); toast.success('Welcome back to MathMaster'); const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname; const user = useAuthStore.getState().user; navigate(from || (user?.role === 'teacher' ? '/teacher' : '/dashboard'), { replace: true }); } catch (error) { const message = error instanceof Error ? error.message : 'Unable to sign in. Please check your details.'; setServerError(message); }
  };

  const fillDemo = (username: string) => { setValue('username', username); setValue('password', 'password123'); };

  return <AuthLayout title="Welcome back" subtitle="Sign in to continue your learning journey."><form onSubmit={handleSubmit(onSubmit)} className="space-y-5"><div><Label htmlFor="username">Username</Label><div className="relative mt-2"><UserRound className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" /><Input id="username" placeholder="your_username" className="pl-10" {...register('username')} /></div>{errors.username && <p className="mt-1.5 text-xs text-danger">{errors.username.message}</p>}</div><div><div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">Forgot password?</Link></div><div className="relative mt-2"><LockKeyhole className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" /><Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="px-10" {...register('password')} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-2.5 rounded p-1 text-ink-400 hover:text-ink-700" aria-label="Toggle password visibility">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>}</div><label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400"><Checkbox {...register('remember')} /> Remember me</label>{serverError && <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{serverError}</div>}<Button type="submit" variant="gradient" size="lg" loading={isSubmitting} className="w-full">Sign in</Button></form><div className="my-7 flex items-center gap-4"><div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" /><span className="text-xs text-ink-400">or</span><div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" /></div><p className="text-center text-sm text-ink-500 dark:text-ink-400">New to MathMaster? <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Create an account</Link></p><div className="mt-8 rounded-2xl border border-ink-200 bg-ink-50/80 p-4 dark:border-ink-700 dark:bg-ink-800/50"><div className="mb-3 flex items-center gap-2"><UserRound className="h-4 w-4 text-brand-500" /><p className="text-xs font-semibold text-ink-700 dark:text-ink-300">Try a demo account</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => fillDemo('student@demo.com')} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-ink-600 shadow-sm transition-colors hover:bg-brand-50 hover:text-brand-700 dark:bg-ink-700 dark:text-ink-300">Student demo</button><button type="button" onClick={() => fillDemo('teacher@demo.com')} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-ink-600 shadow-sm transition-colors hover:bg-brand-50 hover:text-brand-700 dark:bg-ink-700 dark:text-ink-300">Teacher demo</button></div></div></AuthLayout>;
}
