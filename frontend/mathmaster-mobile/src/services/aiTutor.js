// AI tutor service: non-streaming ask, SSE streaming, session history.
import { API_URL, USE_MOCK_DATA, del, get, post } from './api';
import { useAuthStore } from '../stores/authStore';
import { mockAISessions, mockAskAI } from '../mocks/aiTutor';

export async function askAI(payload) {
  if (USE_MOCK_DATA) return mockAskAI(payload);
  return post('/api/ai-tutor/ask-ai-tutor/', payload);
}

/**
 * SSE streaming ask. Parses `data: {"token": "..."}` lines and calls
 * onToken per chunk; resolves with the full answer. Falls back to the
 * non-streaming endpoint if the platform lacks ReadableStream.
 */
export async function askAIStream(payload, { onToken, onError } = {}) {
  if (USE_MOCK_DATA) {
    const answer = await mockAskAI(payload);
    const tokens = answer.answer.match(/\S+\s*/g) || [answer.answer];
    for (const t of tokens) {
      // Simulate streaming cadence.
      await new Promise((r) => setTimeout(r, 40));
      onToken?.(t);
    }
    return answer;
  }

  const store = useAuthStore.getState();
  const response = await fetch(`${API_URL}/api/ai-tutor/ask-ai-tutor/stream/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${store.accessToken}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok || !response.body) {
    return askAI(payload); // graceful fallback
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  let sessionId = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      let eventName = null;
      let dataLine = null;
      for (const part of line.split('\n')) {
        if (part.startsWith('event: ')) eventName = part.slice(7).trim();
        if (part.startsWith('data: ')) dataLine = part.slice(6);
      }
      if (!dataLine) continue;
      let payloadData;
      try {
        payloadData = JSON.parse(dataLine);
      } catch {
        continue;
      }
      if (eventName === 'error' || payloadData.error) {
        const error = new Error(payloadData.error?.message || payloadData.error || 'AI stream error');
        error.status = payloadData.error?.status;
        onError?.(error);
        throw error;
      }
      if (payloadData.token) {
        full += payloadData.token;
        onToken?.(payloadData.token);
      }
      if (payloadData.session_id) sessionId = payloadData.session_id;
    }
  }
  return { answer: full, session_id: sessionId };
}

export async function getSessions() {
  if (USE_MOCK_DATA) return mockAISessions;
  // Real endpoint: derive sessions from ChatMessages via the API (see backend ai_tutor).
  const data = await get('/api/ai-tutor/sessions/');
  return data.results ?? data;
}

export async function getSession(id) {
  if (USE_MOCK_DATA) return mockAISessions.find((session) => String(session.id) === String(id));
  return get(`/api/ai-tutor/sessions/${id}/`);
}

export async function deleteSession(id) {
  if (USE_MOCK_DATA) return { ok: true };
  return del(`/api/ai-tutor/sessions/${id}/`);
}
