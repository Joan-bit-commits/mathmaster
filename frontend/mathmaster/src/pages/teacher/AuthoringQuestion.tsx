import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, Check, Trash2, Upload, FileJson } from 'lucide-react';
import { useCreateQuestion, useBulkCreateQuestions } from '@/hooks/useTeacher';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea, Label } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type QType = 'multiple_choice' | 'true_false' | 'short_answer';

export default function AuthoringQuestion() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const quizId = params.get('quiz') ?? '';
  const createQuestion = useCreateQuestion();
  const bulkCreate = useBulkCreateQuestions();

  const [qType, setQType] = React.useState<QType>('multiple_choice');
  const [text, setText] = React.useState('');
  const [choices, setChoices] = React.useState<string[]>(['', '']);
  const [correctChoice, setCorrectChoice] = React.useState(0);
  const [trueFalseAnswer, setTrueFalseAnswer] = React.useState('true');
  const [shortAnswer, setShortAnswer] = React.useState('');
  const [explanation, setExplanation] = React.useState('');
  const [questionNumber, setQuestionNumber] = React.useState(1);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importData, setImportData] = React.useState('');
  const [importError, setImportError] = React.useState('');

  const resetForm = () => { setText(''); setChoices(['', '']); setCorrectChoice(0); setTrueFalseAnswer('true'); setShortAnswer(''); setExplanation(''); };

  const buildData = () => {
    const base = { text, explanation, order: questionNumber, type: qType as never };
    if (qType === 'multiple_choice') return { ...base, choices: choices.filter(Boolean), correct_answer: choices[correctChoice] ?? '' };
    if (qType === 'true_false') return { ...base, choices: ['True', 'False'], correct_answer: trueFalseAnswer === 'true' ? 'True' : 'False' };
    return { ...base, correct_answer: shortAnswer };
  };

  const validate = () => {
    if (text.trim().length < 5) { toast.error('Question text must be at least 5 characters'); return false; }
    if (qType === 'multiple_choice') {
      const valid = choices.filter(Boolean);
      if (valid.length < 2) { toast.error('Add at least 2 choices'); return false; }
      if (!choices[correctChoice]?.trim()) { toast.error('Please mark a correct answer'); return false; }
    }
    if (qType === 'short_answer' && !shortAnswer.trim()) { toast.error('Please provide a correct answer'); return false; }
    return true;
  };

  const handleSave = async (addAnother: boolean) => {
    if (!quizId) { toast.error('No quiz selected'); return; }
    if (!validate()) return;
    try {
      await createQuestion.mutateAsync({ quizId, data: buildData() });
      toast.success(addAnother ? 'Question saved' : 'Question saved');
      if (addAnother) { setQuestionNumber((n) => n + 1); resetForm(); }
      else navigate('/teacher/content');
    } catch { toast.error('Could not save question'); }
  };

  const handleImport = async () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importData);
      const questions = Array.isArray(parsed) ? parsed : [parsed];
      const validated = questions.map((q: Record<string, unknown>) => ({
        text: String(q.text ?? ''),
        type: (q.type === 'true_false' ? 'multiple_choice' : q.type) as never,
        choices: Array.isArray(q.choices) ? q.choices.map(String) : undefined,
        correct_answer: String(q.correct_answer ?? ''),
        explanation: String(q.explanation ?? ''),
        order: 1,
      }));
      if (validated.some((q: { text: string }) => q.text.length < 5)) { setImportError('Each question needs text (min 5 chars)'); return; }
      await bulkCreate.mutateAsync({ quizId, questions: validated });
      toast.success(`${validated.length} questions imported`);
      setImportOpen(false);
      setImportData('');
    } catch { setImportError('Invalid JSON format'); }
  };

  const typeTabs: { key: QType; label: string }[] = [{ key: 'multiple_choice', label: 'Multiple choice' }, { key: 'true_false', label: 'True/False' }, { key: 'short_answer', label: 'Short answer' }];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/teacher/content')} className="mb-4"><ArrowLeft className="h-4 w-4" /> Back</Button>
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" /> Import JSON</Button>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white">New question</h1>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">Question {questionNumber}</span>
        </div>

        <Card className="mt-6 p-6 sm:p-8">
          {/* Type selector */}
          <div className="flex gap-2 rounded-xl bg-ink-100 p-1 dark:bg-ink-700">
            {typeTabs.map((tab) => (
              <button key={tab.key} onClick={() => setQType(tab.key)} className={cn('flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all', qType === tab.key ? 'bg-white text-ink-900 shadow-soft dark:bg-ink-800 dark:text-ink-100' : 'text-ink-500 hover:text-ink-700 dark:text-ink-400')}>{tab.label}</button>
            ))}
          </div>

          {/* Question text */}
          <div className="mt-5">
            <Label htmlFor="q-text">Question text <span className="text-danger">*</span></Label>
            <Textarea id="q-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter your question..." className="mt-2 min-h-[100px]" />
            <p className="mt-1.5 text-xs text-ink-400">Supports LaTeX in v1.5</p>
          </div>

          {/* MC choices */}
          {qType === 'multiple_choice' && (
            <div className="mt-5">
              <Label>Choices</Label>
              <div className="mt-2 space-y-2">
                {choices.map((choice, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button onClick={() => setCorrectChoice(i)} className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 transition-all', correctChoice === i ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-200 text-ink-400 hover:border-brand-300 dark:border-ink-600')}>
                      {correctChoice === i ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + i)}
                    </button>
                    <Input value={choice} onChange={(e) => { const next = [...choices]; next[i] = e.target.value; setChoices(next); }} placeholder={`Choice ${String.fromCharCode(65 + i)}`} />
                    {choices.length > 2 && <button onClick={() => { setChoices(choices.filter((_, idx) => idx !== i)); if (correctChoice >= i) setCorrectChoice(0); }} className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                ))}
                {choices.length < 5 && <Button variant="ghost" size="sm" onClick={() => setChoices([...choices, ''])}><Plus className="h-3.5 w-3.5" /> Add choice</Button>}
              </div>
            </div>
          )}

          {/* T/F */}
          {qType === 'true_false' && (
            <div className="mt-5">
              <Label>Correct answer</Label>
              <div className="mt-2 flex gap-2">
                {[{ val: 'true', label: 'True' }, { val: 'false', label: 'False' }].map((opt) => (
                  <button key={opt.val} onClick={() => setTrueFalseAnswer(opt.val)} className={cn('flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all', trueFalseAnswer === opt.val ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300' : 'border-ink-200 text-ink-500 hover:border-brand-200 dark:border-ink-600')}>{opt.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Short answer */}
          {qType === 'short_answer' && (
            <div className="mt-5">
              <Label htmlFor="sa-answer">Correct answer <span className="text-danger">*</span></Label>
              <Input id="sa-answer" value={shortAnswer} onChange={(e) => setShortAnswer(e.target.value)} placeholder="Enter the correct answer" className="mt-2" />
            </div>
          )}

          {/* Explanation */}
          <div className="mt-5">
            <Label htmlFor="q-explain">Explanation</Label>
            <Textarea id="q-explain" value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explain why the answer is correct..." className="mt-2 min-h-[60px]" />
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-5 dark:border-ink-700">
            <Button variant="ghost" onClick={() => navigate('/teacher/content')}>Cancel</Button>
            <div className="flex gap-2">
              <Button variant="secondary" loading={createQuestion.isPending} onClick={() => void handleSave(true)}><Plus className="h-4 w-4" /> Save & add another</Button>
              <Button variant="gradient" loading={createQuestion.isPending} onClick={() => void handleSave(false)}><Check className="h-4 w-4" /> Save & finish</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Import questions from JSON</DialogTitle></DialogHeader>
          <div className="py-2">
            <div className="flex items-center gap-2 rounded-xl bg-ink-100 p-3 text-xs text-ink-500 dark:bg-ink-700"><FileJson className="h-4 w-4" /> Paste JSON array of questions below</div>
            <Textarea value={importData} onChange={(e) => setImportData(e.target.value)} placeholder='[{"text":"2+2?","type":"short_answer","correct_answer":"4","explanation":"Basic addition"}]' className="mt-3 min-h-[140px] font-mono text-xs" />
            {importError && <p className="mt-2 text-xs text-danger">{importError}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <Button variant="gradient" loading={bulkCreate.isPending} onClick={() => void handleImport()}><Upload className="h-4 w-4" /> Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
