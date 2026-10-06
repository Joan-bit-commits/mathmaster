import { get, post, del, uploadFile, streamSSE, type SSECallbacks } from '@/lib/api';
import type { DocumentChunk, DocumentItem, DocumentSession, DocumentSessionDetail } from '@/types/pillar1';

export function fetchDocuments(page = 1): Promise<{ count: number; next: string | null; previous: string | null; results: DocumentItem[] }> {
  return get('/api/documents/', { params: { page } });
}

export function fetchDocument(id: string): Promise<DocumentItem> {
  return get<DocumentItem>(`/api/documents/${id}/`);
}

export async function deleteDocument(id: string): Promise<void> {
  await del(`/api/documents/${id}/`);
}

export function uploadDocument(
  file: File,
  metadata: { title: string; document_type: string },
  onProgress?: (percent: number) => void,
): Promise<DocumentItem> {
  return uploadFile('/api/documents/', file, metadata, onProgress) as Promise<DocumentItem>;
}

export function processDocument(id: string): Promise<DocumentItem> {
  return post<DocumentItem>(`/api/documents/${id}/process/`);
}

export function fetchDocumentChunks(id: string): Promise<DocumentChunk[]> {
  return get<DocumentChunk[]>(`/api/documents/${id}/chunks/`);
}

export function fetchDocumentChunk(id: string, chunkId: string): Promise<DocumentChunk> {
  return get<DocumentChunk>(`/api/documents/${id}/chunks/${chunkId}/`);
}

export function fetchDocumentSessions(id: string): Promise<DocumentSession[]> {
  return get<unknown>(`/api/documents/${id}/sessions/`).then((data) => {
    // Global DRF pagination wraps list endpoints as {count, next, results}.
    const items = Array.isArray(data) ? data : (data as { results?: unknown[] })?.results ?? [];
    return (items as any[]).map((s) => ({
      id: String(s.id),
      document_id: String(s.document ?? s.document_id ?? id),
      // The backend chat session is titled with the first question.
      question: s.question ?? s.title ?? '',
      message_count: s.message_count ?? (Array.isArray(s.messages) ? s.messages.length : 0),
      created_at: s.created_at ?? '',
    }));
  });
}

export function fetchDocumentSession(id: string, sessionId: string): Promise<DocumentSessionDetail> {
  return get<DocumentSessionDetail>(`/api/documents/${id}/sessions/${sessionId}/`);
}

export async function deleteDocumentSession(id: string, sessionId: string): Promise<void> {
  await del(`/api/documents/${id}/sessions/${sessionId}/`);
}

export function askDocument(id: string, question: string, sessionId?: string): Promise<{ answer: string; session_id: string; citations: DocumentChunk[] }> {
  return post(`/api/documents/${id}/ask/`, { question, session_id: sessionId });
}

export function askDocumentStream(
  documentId: string,
  question: string,
  sessionId: string | null,
  callbacks: SSECallbacks,
): Promise<void> {
  return streamSSE(
    `/api/documents/${documentId}/ask/stream/`,
    { question, session_id: sessionId ?? undefined },
    callbacks,
  );
}
