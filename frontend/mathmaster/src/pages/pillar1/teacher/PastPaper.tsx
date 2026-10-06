import * as React from 'react';
import { Upload, FileText, X, Trash2, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Label } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadProgressModal } from '@/components/pillar1/UploadProgressModal';
import { UNEBCodeBadge } from '@/components/pillar1/UNEBCodeBadge';
import { uploadPastPaper, pollPastPaperUntilProcessed, extractPastPaperQuestions, savePastPaperAsQuiz } from '@/services/pastPapers';
import { parseApiError } from '@/lib/api';
import { mockExtractedQuestions } from '@/mocks/pillar1Mocks';
import type { ExtractedQuestion } from '@/types/pillar1';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

type Stage = 'upload' | 'processing' | 'extracted' | 'saving';

export default function PastPaper() {
  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState('');
  const [year, setYear] = React.useState('2024');
  const [subject, setSubject] = React.useState('Mathematics');
  const [difficulty, setDifficulty] = React.useState('medium');
  const [stage, setStage] = React.useState<Stage>('upload');
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [paperId, setPaperId] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<ExtractedQuestion[]>([]);
  const [quizTitle, setQuizTitle] = React.useState('');
  const dragRef = React.useRef<HTMLDivElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { toast.error('Please select a PDF file'); return; }
    if (f.size > 20 * 1024 * 1024) { toast.error('File must be under 20MB'); return; }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleGenerate = async () => {
    if (!file) { toast.error('Please select a PDF file'); return; }
    setUploading(true);
    setProgress(0);
    try {
      const paper = USE_MOCKS
        ? { id: 'pp-mock', title, year: Number(year), subject, difficulty, file_url: '', processing_status: 'ready' as const, question_count: 0, created_at: new Date().toISOString() }
        : await uploadPastPaper(file, { title: title || file.name, year, subject, difficulty }, (p) => setProgress(p));
      setPaperId(paper.id);
      setUploading(false);
      setStage('processing');
      if (!USE_MOCKS) {
        await pollPastPaperUntilProcessed(paper.id);
      }
      setStage('extracted');
      const extracted = USE_MOCKS ? mockExtractedQuestions : await extractPastPaperQuestions(paper.id);
      setQuestions(extracted);
      setQuizTitle(`${title} — Quiz`);
      toast.success('Questions extracted!');
    } catch (err) {
      toast.error(parseApiError(err));
      setStage('upload');
      setUploading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!paperId) return;
    setStage('saving');
    try {
      if (!USE_MOCKS) {
        await savePastPaperAsQuiz(paperId, { title: quizTitle, questions });
      }
      toast.success('Quiz saved successfully!');
      setStage('upload');
      setFile(null);
      setTitle('');
      setQuestions([]);
    } catch (err) {
      toast.error(parseApiError(err));
      setStage('extracted');
    }
  };

  const removeQuestion = (id: string) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  return (
    <AppShell>
      <PageHeader title="Past Paper → Quiz" description="Upload a UCE or UACE past paper PDF and automatically extract quiz questions." />

      <Card className="mt-6 p-6">
        {stage === 'upload' && (
          <>
            {!file ? (
              <div ref={dragRef} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} onDragOver={(e) => e.preventDefault()} onClick={() => document.getElementById('pp-file-input')?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 p-12 transition-colors hover:border-brand-300 dark:border-ink-700 dark:hover:border-brand-700">
                <Upload className="h-12 w-12 text-ink-300" />
                <p className="mt-4 text-sm font-medium text-ink-600 dark:text-ink-300">Drag and drop a PDF here</p>
                <p className="mt-1 text-xs text-ink-400">PDF only, max 20MB</p>
                <input id="pp-file-input" type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-ink-50 p-4 dark:bg-ink-800">
                  <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-brand-500" /><span className="truncate text-sm font-medium text-ink-700 dark:text-ink-300">{file.name}</span></div>
                  <button onClick={() => { setFile(null); setTitle(''); }} className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700" aria-label="Remove file"><X className="h-4 w-4" /></button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label htmlFor="pp-title">Title</Label><Input id="pp-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" placeholder="Paper title" /></div>
                  <div><Label htmlFor="pp-year">Year</Label><Input id="pp-year" value={year} onChange={(e) => setYear(e.target.value)} className="mt-2" placeholder="2024" /></div>
                  <div><Label>Subject</Label><Select value={subject} onValueChange={setSubject}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Mathematics">Mathematics</SelectItem><SelectItem value="Physics">Physics</SelectItem><SelectItem value="Chemistry">Chemistry</SelectItem></SelectContent></Select></div>
                  <div><Label>Difficulty</Label><Select value={difficulty} onValueChange={setDifficulty}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
                </div>
                <div className="flex justify-end"><Button variant="gradient" onClick={handleGenerate} loading={uploading}><Upload className="h-4 w-4" /> Generate quiz</Button></div>
              </div>
            )}
          </>
        )}

        {stage === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
            <p className="mt-4 text-sm font-medium text-ink-600 dark:text-ink-300">Processing past paper...</p>
            <p className="mt-1 text-xs text-ink-400">Extracting questions from the PDF. This may take a moment.</p>
          </div>
        )}

        {(stage === 'extracted' || stage === 'saving') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Extracted questions ({questions.length})</h3>
              <Badge tone="success">{questions.length} found</Badge>
            </div>
            <AnimatePresence>
              {questions.map((q, i) => (
                <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.05 }}>
                  <Card className="flex items-start gap-3 p-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-600">{q.question_number}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink-800 dark:text-ink-100">{q.text}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge tone="neutral">{q.marks} marks</Badge>
                        {q.topic_code && <UNEBCodeBadge code={q.topic_code} />}
                        {q.answer && <details><summary className="cursor-pointer text-xs font-medium text-emerald-600">Show answer</summary><p className="mt-1 text-sm font-semibold text-emerald-600">{q.answer}</p></details>}
                      </div>
                    </div>
                    <button onClick={() => removeQuestion(q.id)} className="rounded-lg p-1 text-ink-300 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10" aria-label="Remove question"><Trash2 className="h-4 w-4" /></button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex items-center gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
              <div className="flex-1"><Label htmlFor="quiz-title">Quiz title</Label><Input id="quiz-title" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className="mt-1" /></div>
              <Button variant="gradient" onClick={handleSaveQuiz} loading={stage === 'saving'} className="mt-6"><Check className="h-4 w-4" /> Save as quiz</Button>
            </div>
          </div>
        )}
      </Card>

      <UploadProgressModal open={uploading} fileName={file?.name ?? ''} progress={progress} />
    </AppShell>
  );
}
