import { BookOpen, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UNEBCodeBadge } from './UNEBCodeBadge';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function TopicContextCard({
  code,
  topicName,
  level,
  textbookRef,
}: {
  code: string;
  topicName: string;
  level: string;
  textbookRef?: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
        <BookOpen className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <UNEBCodeBadge code={code} />
          <Badge tone="neutral">{level}</Badge>
        </div>
        <p className="mt-1.5 truncate text-sm font-semibold text-ink-900 dark:text-ink-100">{topicName}</p>
        {textbookRef && <p className="mt-0.5 truncate text-xs text-ink-400">{textbookRef}</p>}
      </div>
      <Link
        to={`/curriculum/topic?code=${encodeURIComponent(code)}`}
        className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        View in syllabus <ExternalLink className="ml-0.5 inline h-3 w-3" />
      </Link>
    </Card>
  );
}
