import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, GraduationCap, School } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { parseAuthError } from '@/lib/authErrors';
import { cn } from '@/lib/utils';

// These mirror the server's rules (Django validators), so people see them *before* submitting
// instead of getting a rejection after.
const passwordRules = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'An uppercase and a lowercase letter', test: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value) },
  { label: 'At least one number', test: (value: string) => /\d/.test(value) },
];

const schema = z
  .object({
    firstName: z.string().trim().min(2, 'Enter your first name'),
    username: z
      .string()
      .trim()
      .min(3, 'At least 3 characters')
      .max(150, 'Too long')
      .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers and underscores only'),
    email: z.string().trim().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .refine((v) => /[A-Z]/.test(v) && /[a-z]/.test(v), 'Include an uppercase and a lowercase letter')
      .refine((v) => /\d/.test(v), 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Repeat your password'),
    terms: z.boolean().refine(Boolean, 'You must accept the terms to continue'),
  })
  .refine((data) => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
type FormValues = z.infer<typeof schema>;
type Role = 'student' | 'teacher';

const roles: { value: Role; title: string; hint: string; icon: typeof School }[] = [
  { value: 'student', title: 'I am a student', hint: 'Learn at your own pace', icon: GraduationCap },
  { value: 'teacher', title: 'I am a teacher', hint: 'Guide your students', icon: School },
];

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-danger">{message}</p> : null;
}

export default function Register() {
  const navigate = useNavigate();
  const registerAccount = useAuthStore((state) => state.register);
  const [role, setRole] = React.useState<Role>('student');
  const [serverError, setServerError] = React.useState('');
  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { terms: false } });
  const password = watch('password', '') ?? '';

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      await registerAccount({
        username: values.username,
        email: values.email,
        password: values.password,
        password2: values.confirmPassword,
        role,
        first_name: values.firstName,
      });
      toast.success('Your account is ready');
      navigate('/register-success', { state: { name: values.firstName }, replace: true });
    } catch (err) {
      const { message, fields } = parseAuthError(err, 'register');
      // Put server-side problems (e.g. "username already exists") next to the field they belong to.
      for (const [name, text] of Object.entries(fields)) {
        if (name in schema.shape) setError(name as keyof FormValues, { type: 'server', message: text });
      }
      setServerError(message);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start building confidence with every equation.">
      <div role="radiogroup" aria-label="Account type" className="mb-7 grid grid-cols-2 gap-3">
        {roles.map(({ value, title, hint, icon: Icon }) => {
          const active = role === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setRole(value)}
              className={cn(
                'rounded-2xl border-2 p-4 text-left transition-all',
                active
                  ? 'border-brand-500 bg-brand-50 shadow-glow-brand dark:bg-brand-900/20'
                  : 'border-ink-200 bg-white hover:border-brand-200 dark:border-ink-700 dark:bg-ink-800',
              )}
            >
              <Icon className={cn('h-6 w-6', active ? 'text-brand-500' : 'text-ink-400')} />
              <p className="mt-3 text-sm font-semibold text-ink-800 dark:text-ink-100">{title}</p>
              <p className="mt-1 text-xs text-ink-400">{hint}</p>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" autoComplete="given-name" className="mt-2" placeholder="Amina" aria-invalid={!!errors.firstName} {...register('firstName')} />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" autoComplete="username" autoCapitalize="none" className="mt-2" placeholder="amina_math" aria-invalid={!!errors.username} {...register('username')} />
            <FieldError message={errors.username?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-2" placeholder="you@example.com" aria-invalid={!!errors.email} {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="mt-2">
            <PasswordInput id="password" autoComplete="new-password" placeholder="Create a password" aria-invalid={!!errors.password} {...register('password')} />
          </div>
          <ul className="mt-3 space-y-1.5" aria-label="Password requirements">
            {passwordRules.map((rule) => {
              const ok = rule.test(password);
              return (
                <li key={rule.label} className={cn('flex items-center gap-2 text-xs transition-colors', ok ? 'text-success' : 'text-ink-400')}>
                  <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border', ok ? 'border-success bg-success text-white' : 'border-ink-300 dark:border-ink-600')}>
                    {ok && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
          {errors.password && errors.password.type === 'server' && <FieldError message={errors.password.message} />}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="mt-2">
            <PasswordInput id="confirmPassword" autoComplete="new-password" placeholder="Repeat your password" aria-invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <p className="rounded-xl bg-ink-50 px-4 py-3 text-xs leading-5 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
          Have a class code from your school? You can add it right after signing up.
        </p>

        <div>
          {/* Radix's checkbox is a <button>, not an <input>, so it must be wired through Controller —
              register() would never receive a change event and the terms box could never validate. */}
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <label className="flex items-start gap-2.5 text-xs leading-5 text-ink-500 dark:text-ink-400">
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!errors.terms} className="mt-0.5" />
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>
            )}
          />
          <FieldError message={errors.terms?.message} />
        </div>

        <div aria-live="polite">
          {serverError && (
            <div role="alert" className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {serverError}
            </div>
          )}
        </div>

        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}