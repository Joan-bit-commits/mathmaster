import { FileWarning } from 'lucide-react';
import { useAuthedBlobUrl } from '@/hooks/useAuthedBlobUrl';

/**
 * Renders the original uploaded document: PDFs in the browser's native PDF
 * viewer (zoom, search, thumbnails), image uploads as an <img>.
 * `page` jumps a PDF to that page (used when a citation chip is clicked).
 */
export function DocumentViewer({
  documentId,
  fileType = 'pdf',
  page = 1,
  title = 'Document',
}: {
  documentId: string;
  fileType?: 'pdf' | 'image';
  page?: number;
  title?: string;
}) {
  const { url, loading, error } = useAuthedBlobUrl(`/api/documents/${documentId}/file/`);

  if (loading) return <div className="h-[75vh] w-full animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800" />;
  if (error || !url) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl bg-ink-100 text-ink-500 dark:bg-ink-800">
        <FileWarning className="h-8 w-8 text-ink-300" />
        <p className="text-sm">Could not load this file.</p>
      </div>
    );
  }
  if (fileType === 'image') {
    return <img src={url} alt={title} className="mx-auto max-h-[75vh] w-auto rounded-xl" />;
  }
  return (
    <iframe
      // key forces a reload when the page changes (hash-only changes are ignored by some browsers)
      key={page}
      src={`${url}#page=${page}`}
      title={title}
      className="h-[75vh] w-full rounded-xl border border-ink-200 dark:border-ink-700"
    />
  );
}
