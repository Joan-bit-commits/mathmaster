import { ArrowLeft, Construction } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

export function Placeholder({ title }: { title: string }) {
  return <AppShell><PageHeader title={title} description="Your personalised learning workspace." /><Card className="mt-8 overflow-hidden"><CardContent className="flex min-h-[420px] flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"><Construction className="h-8 w-8" /></div><h2 className="mt-6 text-xl font-semibold text-ink-900 dark:text-ink-100">Coming in the next lesson</h2><p className="mt-2 max-w-md text-sm leading-6 text-ink-500 dark:text-ink-400">We’re preparing something helpful for this space. Check back soon as MathMaster grows with you.</p></CardContent></Card></AppShell>;
}

export function NotFound() {
  return <div className="flex min-h-screen items-center justify-center bg-ink-50 px-6 dark:bg-ink-900"><div className="text-center"><p className="text-8xl font-bold tracking-tighter text-gradient-brand">404</p><h1 className="mt-5 text-2xl font-bold text-ink-900 dark:text-white">Page not found</h1><p className="mt-2 text-sm text-ink-500 dark:text-ink-400">The page you’re looking for doesn’t exist.</p><Link to="/dashboard" className="mt-7 inline-block"><Button variant="gradient"><ArrowLeft className="h-4 w-4" /> Go home</Button></Link></div></div>;
}
