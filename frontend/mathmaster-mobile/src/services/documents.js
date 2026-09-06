import { API_URL, USE_MOCK_DATA, apiUpload, del, get } from './api';
import { useAuthStore } from '../stores/authStore';
import { mockDocuments, mockDocument, mockChunks, mockSessions } from '../mocks/documents';

export const fetchDocuments = async () => {
  if (USE_MOCK_DATA) return mockDocuments;
  const data = await get('/api/documents/');
  return data.results ?? data;
};
export const fetchDocument = (id) => USE_MOCK_DATA ? mockDocument(id) : get(`/api/documents/${id}/`);
export const deleteDocument = (id) => USE_MOCK_DATA ? Promise.resolve({}) : del(`/api/documents/${id}/`);
export const fetchDocumentChunks = (id) => USE_MOCK_DATA ? mockChunks : get(`/api/documents/${id}/chunks/`);
export const fetchDocumentChunk = (id, chunkId) => USE_MOCK_DATA ? mockChunks.find((chunk) => String(chunk.id) === String(chunkId)) : get(`/api/documents/${id}/chunks/${chunkId}/`);
export const fetchDocumentSessions = (id) => USE_MOCK_DATA ? mockSessions : get(`/api/documents/${id}/sessions/`);
export const fetchDocumentSession = (id, sessionId) => USE_MOCK_DATA ? mockSessions.find((session) => String(session.id) === String(sessionId)) : get(`/api/documents/${id}/sessions/${sessionId}/`);
export const deleteDocumentSession = (id, sessionId) => del(`/api/documents/${id}/sessions/${sessionId}/`);
export const uploadDocument = (file, metadata = {}, onProgress) => { const form = new FormData(); form.append('file', { uri: file.uri, name: file.name || 'document.pdf', type: file.mimeType || 'application/pdf' }); Object.entries(metadata).forEach(([key, value]) => form.append(key, value)); return USE_MOCK_DATA ? Promise.resolve({ ...mockDocuments[0], title: metadata.title || file.name }) : apiUpload.upload('/api/documents/', form, { onProgress }); };
export async function askDocumentStream(documentId, question, sessionId, callbacks = {}) {
  if (USE_MOCK_DATA) { const answer = 'Start by identifying the known values, then apply the correct formula using Ugandan units.'; for (const token of answer.match(/\S+\s*/g) || []) { await new Promise((resolve) => setTimeout(resolve, 35)); callbacks.onToken?.(token); } callbacks.onCitation?.({ page: 23 }); callbacks.onDone?.({ session_id: sessionId || 'mock-session' }); return; }
  const store = useAuthStore.getState(); const response = await fetch(`${API_URL}/api/documents/${documentId}/ask/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${store.accessToken}`, Accept: 'text/event-stream' }, body: JSON.stringify({ question, session_id: sessionId }) });
  if (!response.ok || !response.body) throw new Error(`Document question failed: ${response.status}`);
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
  while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const frames = buffer.split('\n\n'); buffer = frames.pop() || ''; frames.forEach((frame) => frame.split('\n').filter((line) => line.startsWith('data: ')).forEach((line) => { try { const data = JSON.parse(line.slice(6)); if (data.token) callbacks.onToken?.(data.token); if (data.session_id) callbacks.onDone?.(data); if (data.citation) callbacks.onCitation?.(data.citation); } catch {} })); }
}