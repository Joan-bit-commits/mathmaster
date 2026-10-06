import { get, post, uploadFile } from '@/lib/api';
import type { ExtractedQuestion, PastPaper } from '@/types/pillar1';

export function uploadPastPaper(
  file: File,
  metadata: { title: string; year: string; subject: string; difficulty: string },
  onProgress?: (percent: number) => void,
): Promise<PastPaper> {
  return uploadFile('/api/teacher/past-papers/', file, metadata, onProgress) as Promise<PastPaper>;
}

export async function pollPastPaperUntilProcessed(id: string, maxAttempts = 60, intervalMs = 3000): Promise<PastPaper> {
  for (let i = 0; i < maxAttempts; i++) {
    const paper = await get<PastPaper>(`/api/teacher/past-papers/${id}/`);
    if (paper.processing_status === 'ready' || paper.processing_status === 'failed') return paper;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Processing timed out. Please try again.');
}

export function extractPastPaperQuestions(id: string): Promise<ExtractedQuestion[]> {
  return get<ExtractedQuestion[]>(`/api/teacher/past-papers/${id}/extract-quiz/`);
}

export function savePastPaperAsQuiz(
  id: string,
  data: { lesson_id?: string; title: string; questions: ExtractedQuestion[] },
): Promise<{ id: string }> {
  return post(`/api/teacher/past-papers/${id}/save-as-quiz/`, data);
}
