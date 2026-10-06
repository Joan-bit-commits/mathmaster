import * as React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Sparkles, BookOpen, Save, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TopicContextCard } from '@/components/pillar1/TopicContextCard';
import { SolutionStep } from '@/components/pillar1/SolutionStep';
import { ConfidenceIndicator } from '@/components/pillar1/ConfidenceIndicator';
import { ScanImage } from '@/components/pillar1/ScanImage';
import { LocalContextPill } from '@/components/pillar1/LocalContextPill';
import { QuickPromptChips } from '@/components/pillar1/QuickPromptChips';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { fetchScanJob } from '@/services/scan';
import { mockScanJobs } from '@/mocks/pillar1Mocks';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const similarPrompts = ['Find similar problems', 'Show me another example', 'Explain this differently', 'Give me a harder one'];

export default function ScanResult() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const navigate = useNavigate();

  const { data: scan, isLoading, isError, refetch } = useQuery({
    queryKey: ['scan-job', id],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockScanJobs[0]) : fetchScanJob(id)),
    enabled: !!id,
  });

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError || !scan) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load this scan result." /></AppShell>;

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/scan')}><ArrowLeft className="h-4 w-4" /> Back to scans</Button>
        <Button variant="secondary" size="sm" onClick={() => navigate('/scan/upload')}><Camera className="h-4 w-4" /> New scan</Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card className="overflow-hidden p-4">
          <div className="flex items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800" style={{ minHeight: 200 }}>
            <ScanImage scanId={scan.id} width={1200} alt="Problem" className="h-auto rounded-xl object-contain" />
          </div>
        </Card>

        <div className="space-y-4">
          <TopicContextCard code={scan.topic_code ?? ''} topicName={scan.topic_name ?? ''} level={scan.topic_code ? scan.topic_code.split('.')[0] : ''} textbookRef={scan.textbook_ref ?? undefined} />

          <Tabs defaultValue="solution">
            <TabsList>
              <TabsTrigger value="solution">Solution</TabsTrigger>
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="similar">Similar</TabsTrigger>
            </TabsList>

            <TabsContent value="solution">
              <Card className="p-5">
                <MarkdownRenderer content={scan.problem_text} className="prose-sm" />
                <div className="mt-4 rounded-xl bg-brand-500/10 p-4">
                  <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">Final answer</p>
                  <MarkdownRenderer content={scan.final_answer} className="prose-sm mt-1" />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <ConfidenceIndicator value={scan.confidence} />
                  {(scan.context_tags ?? []).map((tag) => <LocalContextPill key={tag} label={tag} />)}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm"><Save className="h-4 w-4" /> Save to notes</Button>
                  <Button variant="ghost" size="sm"><Plus className="h-4 w-4" /> Add to quiz</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="steps">
              <Card className="p-5">
                <div className="space-y-4">
                  {scan.solution_steps.map((step, i) => <SolutionStep key={i} step={step} index={i} />)}
                </div>
                <Button variant="ghost" size="sm" className="mt-4">Explain differently</Button>
              </Card>
            </TabsContent>

            <TabsContent value="similar">
              <Card className="p-5">
                <QuickPromptChips prompts={similarPrompts} onSelect={() => navigate('/ai-tutor')} />
                <div className="mt-4">
                  <Link to="/curriculum/topic" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
                    <BookOpen className="h-4 w-4" /> Browse practice problems
                  </Link>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Card className="mt-6 flex items-center justify-between p-4">
        <p className="text-sm text-ink-500">Need more help with this problem?</p>
        <Button variant="gradient" size="sm" onClick={() => navigate('/ai-tutor')}><Sparkles className="h-4 w-4" /> Ask follow-up</Button>
      </Card>
    </AppShell>
  );
}
