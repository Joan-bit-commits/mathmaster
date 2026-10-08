import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Camera, FileText, Moon, Sparkles, Sun } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/login" className="inline-flex items-center gap-2.5" aria-label="MathMaster">
      <span
        className={
          light
            ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold text-white backdrop-blur-sm'
            : 'flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white'
        }
      >
        M<span className="-mt-3 ml-px text-[11px]">π</span>
      </span>
      <span className={light ? 'text-xl font-bold text-white' : 'text-xl font-bold tracking-tight text-ink-900 dark:text-white'}>
        Math<span className={light ? 'text-brand-200' : 'text-gradient-brand'}>Master</span>
      </span>
    </Link>
  );
}

const features = [
  { icon: BrainCircuit, title: 'AI tutor', text: 'Step-by-step help, whenever you are stuck.' },
  { icon: Camera, title: 'Snap & Solve', text: 'Photograph a problem and see how it is solved.' },
  { icon: FileText, title: 'Study your own notes', text: 'Upload a PDF and ask it questions.' },
];

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const { theme, setTheme, applyTheme } = useThemeStore();
  React.useEffect(() => { applyTheme(); }, [theme, applyTheme]);
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="min-h-screen bg-white dark:bg-ink-900">
      <div className="grid min-h-screen lg:grid-cols-[minmax(440px,1fr)_1.05fr]">
        <div className="flex flex-col px-6 py-6 sm:px-12 lg:px-16">
          <header className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="rounded-xl p-2.5 text-ink-500 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </header>

          <main className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-md">
              {title && (
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-white">{title}</h1>
                  {subtitle && <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-ink-400">{subtitle}</p>}
                </div>
              )}
              {children}
            </div>
          </main>

          <p className="text-center text-xs text-ink-400">Built for ambitious learners across Uganda</p>
        </div>

        <aside className="relative hidden overflow-hidden bg-brand-800 lg:block" aria-hidden>
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
          />

          <div className="relative flex h-full flex-col justify-between px-14 py-12 text-white xl:px-20">
            <Logo light />

            <div>
              <h2 className="max-w-lg text-5xl font-bold leading-[1.08] tracking-tight">
                Make every problem a <span className="text-brand-200">breakthrough.</span>
              </h2>
              <p className="mt-5 max-w-md text-lg leading-8 text-brand-100">
                Your AI-powered study companion for mastering mathematics, one step at a time.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-10 max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 font-mono text-sm backdrop-blur-md"
              >
                <p className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-brand-200">
                  <Sparkles className="h-3.5 w-3.5" /> Worked example
                </p>
                <p className="text-brand-50">2x + 6 = 14</p>
                <p className="mt-1 text-brand-100/80">2x = 14 − 6 = 8</p>
                <p className="mt-1 font-semibold text-white">x = 4</p>
              </motion.div>

              <ul className="mt-8 space-y-4">
                {features.map(({ icon: Icon, title: featureTitle, text }, index) => (
                  <motion.li
                    key={featureTitle}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15"><Icon className="h-4 w-4" /></span>
                    <span>
                      <span className="block text-sm font-semibold">{featureTitle}</span>
                      <span className="block text-sm text-brand-100">{text}</span>
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-brand-200/80">Made for Ugandan secondary school learners</p>
          </div>
        </aside>
      </div>
    </div>
  );
}