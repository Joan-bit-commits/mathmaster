import { ArrowRight, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Quiz } from '@/types/learning';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function QuizCard({ quiz }: { quiz: Quiz }) {
  return <Card hover className="flex flex-col p-5"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-indigo-300"><ClipboardCheck className="h-5 w-5" /></div>{quiz.attempted && quiz.best_score !== null && <Badge tone="success">Best: {quiz.best_score}%</Badge>}</div><h3 className="mt-5 text-base font-semibold text-ink-900 dark:text-ink-100">{quiz.title}</h3><p className="mt-2 min-h-10 text-sm leading-5 text-ink-500 dark:text-ink-400">{quiz.description}</p><div className="mt-5 flex items-center justify-between"><Badge tone="neutral">{quiz.questions_count} questions</Badge><Link to={`/quizzes/${quiz.id}`}><Button variant={quiz.attempted ? 'secondary' : 'primary'} size="sm">{quiz.attempted ? 'Retry' : 'Start'}<ArrowRight className="h-3.5 w-3.5" /></Button></Link></div></Card>;
}
