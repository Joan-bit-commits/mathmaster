import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadProgressModal } from '@/components/pillar1/UploadProgressModal';
import { uploadDocument } from '@/services/documents';
import { parseApiError } from '@/lib/api';

const docTypes = [
  { value: 'textbook', label: 'Textbook' },
  { value: 'past_paper', label: 'Past paper' },
  { value: 'notes', label: 'Notes' },
  { value: 'worksheet', label: 'Worksheet' },
  { value: 'other', label: 'Other' },
];

export default function DocumentsUpload() {
  const navigate = useNavigate();
  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState('');
  const [docType, setDocType] = React.useState('textbook');
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const dragRef = React.useRef<HTMLDivElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file'); return; }
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadDocument(file, { title: title || file.name, document_type: docType }, (p) => setProgress(p));
      toast.success('Document uploaded');
      navigate(`/documents/${result.id}`);
    } catch (err) {
      toast.error(parseApiError(err));
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Upload document" description="Upload a PDF or document to ask questions with cited answers." />
      <Card className="mt-6 p-6">
        {!file ? (
          <div
            ref={dragRef}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); dragRef.current?.classList.add('border-brand-400', 'bg-brand-50'); }}
            onDragLeave={() => { dragRef.current?.classList.remove('border-brand-400', 'bg-brand-50'); }}
            onClick={() => document.getElementById('doc-file-input')?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 p-12 transition-colors hover:border-brand-300 dark:border-ink-700 dark:hover:border-brand-700"
          >
            <Upload className="h-12 w-12 text-ink-300" />
            <p className="mt-4 text-sm font-medium text-ink-600 dark:text-ink-300">Drag and drop a file here</p>
            <p className="mt-1 text-xs text-ink-400">PDF, DOCX, or images up to 20MB</p>
            <input id="doc-file-input" type="file" accept=".pdf,.docx,.png,.jpg,.jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-ink-50 p-4 dark:bg-ink-800">
              <span className="truncate text-sm font-medium text-ink-700 dark:text-ink-300">{file.name}</span>
              <button onClick={() => { setFile(null); setTitle(''); }} className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700" aria-label="Remove file">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div><Label htmlFor="doc-title">Title</Label><Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" placeholder="Document title" /></div>
            <div>
              <Label>Document type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>{docTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setFile(null); setTitle(''); }}>Choose another</Button>
              <Button variant="primary" onClick={handleUpload} loading={uploading}><Upload className="h-4 w-4" /> Upload</Button>
            </div>
          </div>
        )}
      </Card>
      <UploadProgressModal open={uploading} fileName={file?.name ?? ''} progress={progress} />
    </AppShell>
  );
}
