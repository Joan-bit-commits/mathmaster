import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadProgressModal } from '@/components/pillar1/UploadProgressModal';
import { submitScan } from '@/services/scan';
import { parseApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ScanUpload() {
  const navigate = useNavigate();
  const [preview, setPreview] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const dragRef = React.useRef<HTMLDivElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSolve = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const result = await submitScan(file, (p) => setProgress(p));
      toast.success('Solution ready!');
      navigate(`/scan/result?id=${result.id}`);
    } catch (err) {
      toast.error(parseApiError(err));
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Snap a problem" description="Upload an image of your math problem and get a step-by-step solution." />
      <Card className="mt-6 p-6">
        {!preview ? (
          <div
            ref={dragRef}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); dragRef.current?.classList.add('border-brand-400', 'bg-brand-50'); }}
            onDragLeave={() => { dragRef.current?.classList.remove('border-brand-400', 'bg-brand-50'); }}
            onClick={() => document.getElementById('scan-file-input')?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 p-12 transition-colors hover:border-brand-300 dark:border-ink-700 dark:hover:border-brand-700"
          >
            <Camera className="h-12 w-12 text-ink-300" />
            <p className="mt-4 text-sm font-medium text-ink-600 dark:text-ink-300">Drag and drop an image here</p>
            <p className="mt-1 text-xs text-ink-400">or click to browse</p>
            <input id="scan-file-input" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img src={preview} alt="Problem preview" className="max-h-96 w-full rounded-2xl object-contain" />
              <button onClick={() => { setPreview(null); setFile(null); }} className="absolute right-3 top-3 rounded-lg bg-ink-900/50 p-2 text-white hover:bg-ink-900/70" aria-label="Remove image">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setPreview(null); setFile(null); }}>Choose another</Button>
              <Button variant="primary" onClick={handleSolve} loading={uploading}>
                <Upload className="h-4 w-4" /> Solve it
              </Button>
            </div>
          </div>
        )}
      </Card>
      <UploadProgressModal open={uploading} fileName={file?.name ?? ''} progress={progress} />
    </AppShell>
  );
}
