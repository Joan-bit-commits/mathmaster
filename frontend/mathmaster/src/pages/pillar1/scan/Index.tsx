import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, FileText, Clock3, ArrowRight, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanImage } from '@/components/pillar1/ScanImage';
import { useQuery } from '@tanstack/react-query';
import { fetchScanHistory } from '@/services/scan';
import { mockScanJobs } from '@/mocks/pillar1Mocks';
import { formatRelativeTime } from '@/lib/utils';
import * as React from 'react';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export default function ScanIndex() {
  const { data, isLoading } = useQuery({
    queryKey: ['scan-history'],
    queryFn: () => (USE_MOCKS ? Promise.resolve({ count: mockScanJobs.length, next: null, previous: null, results: mockScanJobs }) : fetchScanHistory()),
  });
  const scans = data?.results ?? [];

  return (
    <AppShell>
      <PageHeader title="Snap & Solve" description="Snap a photo of any math problem and get a step-by-step solution." />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Camera, title: 'Snap a problem', desc: 'Take a photo of any math question', href: '/scan/upload', gradient: 'from-brand-500 to-brand-600' },
          { icon: FileText, title: 'Upload PDF', desc: 'Upload a worksheet or past paper', href: '/documents/upload', gradient: 'from-accent-500 to-indigo-600' },
          { icon: Sparkles, title: 'Review my work', desc: 'Go through your recent scans', href: '/scan/result', gradient: 'from-emerald-500 to-teal-600' },
        ].map((tile, i) => (
          <Link key={tile.title} to={tile.href}>
            <motion.div whileHover={{ y: -4 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`rounded-2xl bg-gradient-to-br ${tile.gradient} p-6 text-white shadow-soft transition-shadow hover:shadow-card`}>
              <tile.icon className="h-8 w-8" />
              <p className="mt-5 text-lg font-semibold">{tile.title}</p>
              <p className="mt-1 text-sm text-white/75">{tile.desc}</p>
              <ArrowRight className="mt-4 h-5 w-5 text-white/50" />
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-ink-400" />
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">Recent scans</h2>
        </div>
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 w-64 shrink-0 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />)}</div>
        ) : scans.length === 0 ? (
          <Card className="p-8 text-center"><Camera className="mx-auto h-10 w-10 text-ink-300" /><p className="mt-3 text-sm text-ink-500">No scans yet. Snap your first problem!</p></Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {scans.map((scan, i) => (
              <Link key={scan.id} to={`/scan/result?id=${scan.id}`}>
                <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card hover className="w-64 shrink-0 p-4">
                    <div className="h-32 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                      <ScanImage scanId={scan.id} width={480} />
                    </div>
                    <p className="mt-3 line-clamp-1 text-sm font-semibold text-ink-900 dark:text-ink-100">{scan.problem_text}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge tone="brand">{scan.topic_name}</Badge>
                      <span className="text-xs text-ink-400">{formatRelativeTime(scan.created_at)}</span>
                    </div>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
