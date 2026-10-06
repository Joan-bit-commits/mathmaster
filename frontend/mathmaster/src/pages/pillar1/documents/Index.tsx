import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, FileText } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentCard } from '@/components/pillar1/DocumentCard';
import { fetchDocuments, deleteDocument } from '@/services/documents';
import { mockDocuments } from '@/mocks/pillar1Mocks';
import { parseApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const filterChips = ['All', 'Recent', 'Ready'] as const;

export default function DocumentsIndex() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<typeof filterChips[number]>('All');

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => (USE_MOCKS ? Promise.resolve({ count: mockDocuments.length, next: null, previous: null, results: mockDocuments }) : fetchDocuments()),
  });

  let docs = data?.results ?? [];
  if (search) docs = docs.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));
  if (filter === 'Recent') docs = [...docs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (filter === 'Ready') docs = docs.filter((d) => d.processing_status === 'ready');

  const handleDelete = async (id: string) => {
    try {
      if (!USE_MOCKS) await deleteDocument(id);
      toast.success('Document deleted');
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (err) { toast.error(parseApiError(err)); }
  };

  return (
    <AppShell>
      <PageHeader title="My Documents" description="Upload textbooks and notes, then ask questions with cited answers." />
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" />
          <Input placeholder="Search documents..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="gradient" onClick={() => navigate('/documents/upload')}><Upload className="h-4 w-4" /> Upload document</Button>
      </div>

      <div className="mt-4 flex gap-2">
        {filterChips.map((chip) => (
          <button key={chip} onClick={() => setFilter(chip)} className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors', filter === chip ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-400')}>
            {chip}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />)}</div>
      ) : docs.length === 0 ? (
        <Card className="mt-6 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-ink-300" />
          <p className="mt-4 text-sm font-medium text-ink-600 dark:text-ink-300">No documents yet</p>
          <p className="mt-1 text-xs text-ink-400">Upload a textbook, past paper, or notes to get started.</p>
          <Button variant="gradient" className="mt-6" onClick={() => navigate('/documents/upload')}><Upload className="h-4 w-4" /> Upload your first document</Button>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc, i) => <DocumentCard key={doc.id} doc={doc} index={i} onClick={() => navigate(`/documents/${doc.id}`)} onDelete={() => void handleDelete(doc.id)} />)}
        </div>
      )}
    </AppShell>
  );
}
