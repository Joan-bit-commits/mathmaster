import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Upload, Download, KeyRound, FileSpreadsheet } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadProgressModal } from '@/components/pillar1/UploadProgressModal';
import { bulkImportStudents, generateClassCode } from '@/services/schools';
import { parseApiError } from '@/lib/api';
import { useSchoolId } from '@/hooks/useSchoolId';

export default function BulkImport() {
  const navigate = useNavigate();
  const schoolId = useSchoolId();
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<{ created: number; errors: Array<{ row: number; message: string }> } | null>(null);
  const [classCode, setClassCode] = React.useState<string | null>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) { toast.error('Please select a CSV file'); return; }
    setFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 200);
    try {
      const res = await bulkImportStudents(schoolId, file);
      clearInterval(interval);
      setProgress(100);
      setResult(res);
      toast.success(`${res.created} students imported`);
    } catch (err) {
      clearInterval(interval);
      toast.error(parseApiError(err));
    }
    setUploading(false);
  };

  const handleGenerateCode = async () => {
    try {
      const res = await generateClassCode(schoolId);
      setClassCode(res.code);
      toast.success('Class code generated');
    } catch (err) { toast.error(parseApiError(err)); }
  };

  const sampleCsv = 'email,first_name,last_name,class_level,class_stream,admission_number\nstudent1@school.ac.ug,John,Doe,S3,North,KS-001\nstudent2@school.ac.ug,Jane,Smith,S3,North,KS-002';

  return (
    <AppShell>
      <Button variant="ghost" onClick={() => navigate('/admin/members')}><ArrowLeft className="h-4 w-4" /> Back to members</Button>
      <PageHeader title="Bulk Import Students" description="Upload a CSV file to add multiple students at once." />

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="p-6">
          {!file ? (
            <div onClick={() => document.getElementById('bulk-file-input')?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 p-12 transition-colors hover:border-brand-300 dark:border-ink-700 dark:hover:border-brand-700">
              <Upload className="h-12 w-12 text-ink-300" />
              <p className="mt-4 text-sm font-medium text-ink-600 dark:text-ink-300">Drag and drop a CSV file here</p>
              <p className="mt-1 text-xs text-ink-400">or click to browse</p>
              <input id="bulk-file-input" type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-ink-50 p-4 dark:bg-ink-800">
                <span className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300"><FileSpreadsheet className="h-5 w-5 text-emerald-500" />{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remove</Button>
              </div>
              <Button variant="gradient" onClick={handleImport} loading={uploading}><Upload className="h-4 w-4" /> Import students</Button>
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
              <p className="text-sm font-semibold text-emerald-600">{result.created} students created</p>
              {result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-rose-600">Errors ({result.errors.length})</p>
                  <ul className="mt-1 space-y-1">
                    {result.errors.map((e, i) => <li key={i} className="text-xs text-rose-500">Row {e.row}: {e.message}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">CSV format</h3>
            <p className="mt-2 text-xs text-ink-400">Columns: email, first_name, last_name, class_level, class_stream, admission_number</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => { const blob = new Blob([sampleCsv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'sample_students.csv'; a.click(); }}>
              <Download className="h-3.5 w-3.5" /> Download sample CSV
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-brand-500" /><h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Class code</h3></div>
            <p className="mt-2 text-xs text-ink-400">Generate a one-time code students can use to self-register.</p>
            {classCode ? (
              <div className="mt-4 rounded-xl bg-brand-50 p-4 dark:bg-brand-900/20">
                <p className="text-xs text-ink-400">Share this code:</p>
                <p className="mt-1 font-mono text-lg font-bold text-brand-700 dark:text-brand-300">{classCode}</p>
              </div>
            ) : (
              <Button variant="secondary" size="sm" className="mt-4" onClick={handleGenerateCode}>Generate code</Button>
            )}
          </Card>
        </div>
      </div>

      <UploadProgressModal open={uploading} fileName={file?.name ?? ''} progress={progress} />
    </AppShell>
  );
}