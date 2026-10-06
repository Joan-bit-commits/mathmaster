import { useState } from 'react';
import { FileText } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import type { Citation } from '@/types/pillar1';

export function CitationChip({ citation }: { citation: Citation }) {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        onClick={() => {
          // In a full implementation this would open the PDF viewer at page
          console.log(`Open document at page ${citation.page_number}`);
        }}
        className="inline-flex items-center gap-1 rounded-md bg-brand-500/10 px-1.5 py-0.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-500/20 dark:bg-brand-500/20 dark:text-brand-300"
        aria-label={`Citation: page ${citation.page_number}`}
      >
        <FileText className="h-3 w-3" />
        p. {citation.page_number}
      </button>
      {showPreview && (
        <span className="absolute bottom-full left-0 z-20 mb-1 w-64 rounded-lg border border-ink-200 bg-white p-3 text-xs shadow-lg dark:border-ink-700 dark:bg-ink-800">
          <MarkdownRenderer content={citation.snippet} className="prose-sm" />
        </span>
      )}
    </span>
  );
}
