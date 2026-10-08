import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Building2, Check, FileUp, LayoutDashboard, Sparkles } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useSchoolStore } from '@/stores/schoolStore';
import { homePathFor } from '@/lib/permissions';

type Step = { icon: ElementType; title: string; description: string; href: string };

export default function RegisterSuccess() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const school = useSchoolStore((state) => state.currentSchool);

  // Reaching this page without having just signed up (or after signing out) makes no sense.
  if (!user) return <Navigate to="/login" replace />;

  const name = (location.state as { name?: string } | null)?.name ?? user.first_name ?? user.username;
  const isTeacher = user.role === 'teacher';

  const steps: Step[] = [
    ...(school
      ? []
      : [{ icon: Building2, title: 'Join your school', description: 'Enter the class code your school gave you', href: '/join-school' }]),
    ...(isTeacher
      ? [
          { icon: LayoutDashboard, title: 'Open your dashboard', description: 'See your classes and students', href: '/teacher' },
          { icon: FileUp, title: 'Turn a past paper into a quiz', description: 'Upload a paper and review the questions', href: '/teacher/past-paper' },
        ]
      : [
          { icon: BookOpen, title: 'Explore topics', description: 'Find lessons made for your level', href: '/topics' },
          { icon: Sparkles, title: 'Ask your AI tutor', description: 'Get unstuck with step-by-step help', href: '/ai-tutor' },
        ]),
  ];

  return (
    <AuthLayout>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 15 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-white shadow-lg shadow-success/25"
        >
          <Check className="h-10 w-10" strokeWidth={3} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-7 text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
          Welcome aboard, {name}!
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-400">
          Your account is ready. Here is where to start.
        </motion.p>

        <div className="mt-8 space-y-3 text-left">
          {steps.map(({ icon: Icon, title, description, href }, index) => (
            <motion.div key={title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + index * 0.1 }}>
              <Link
                to={href}
                className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 transition-colors hover:border-brand-300 dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-800 dark:text-ink-100">{title}</span>
                  <span className="mt-0.5 block text-xs text-ink-400">{description}</span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-ink-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        <Link to={homePathFor(user)} className="mt-8 block">
          <Button variant="primary" size="lg" className="w-full">
            Go to dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}