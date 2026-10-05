// AI tutor service v2: SSE + GeoGebra event + refusal detection.
import { API_URL, USE_MOCK_DATA, get, post } from './api';
import { useAuthStore } from '../stores/authStore';
import { mockAISessions, mockAskAI, mockAskAIStream } from '../mocks/aiTutor';

export const REFUSAL_PHRASE = "I'm sorry, but I can only help with mathematics.";

const GEOGEBRA_TAG_RE = /\n\[GEOGEBRA_DATA:\s*(\{.*?\})\s*\]\s*$/s;
function extractGeogebra(text) {
  if (!text) return { visible: text, geo: null };
  const match = text.match(GEOGEBRA_TAG_RE);
  if (!match) return { visible: text, geo: null };
  const visible = text.slice(0, match.index).trimEnd();
  try {
    const parsed = JSON.parse(match[1]);
    if (parsed.view !== '2D' && parsed.view !== '3D') return { visible, geo: null };
    if (!Array.isArray(parsed.commands)) return { visible, geo: null };
    return { visible, geo: parsed };
  } catch { return { visible, geo: null }; }
}
function isRefusal(text) {
  if (!text) return false;
  const { visible } = extractGeogebra(text);
  return visible.toLowerCase().includes(REFUSAL_PHRASE.toLowerCase());
}

export async function askAI(payload) {
  if (USE_MOCK_DATA) return mockAskAI(payload);
  return post('/api/ai-tutor/ask-ai-tutor/', payload);
}

export async function askAIStream(
  payload,
  { onToken, onGeoGebra, onDone, onError } = {},
) {
  if (USE_MOCK_DATA) {
    try {
      const { visible, geo, isRefusal: refusal } = await mockAskAIStream(payload);
      const tokens = visible.match(/\S+\s*/g) || [visible];
      for (const t of tokens) { await new Promise((r) => setTimeout(r, 40)); onToken?.(t); }
      if (geo) onGeoGebra?.(geo);
      onDone?.({ sessionId: payload.session_id || 1, isRefusal: refusal, geogebra: geo });
      return { answer: visible, session_id: payload.session_id || 1, geogebra: geo, is_refusal: refusal };
    } catch (err) { onError?.(err instanceof Error ? err : new Error('Stream failed')); return null; }
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
    const fallback = await askAI(payload);
    if (fallback?.geogebra) onGeoGebra?.(fallback.geogebra);
    onDone?.({ sessionId: fallback?.session_id, isRefusal: fallback?.is_refusal, geogebra: fallback?.geogebra });
    return fallback;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  let sessionId = payload.session_id ?? null;
  let isRefusal = false;
  let geogebra = null;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() || '';
      for (const block of blocks) {
        let eventName = 'message';
        let dataLine = null;
        for (const line of block.split('\n')) {
          if (line.startsWith('event: ')) eventName = line.slice(7).trim();
          else if (line.startsWith('data: ')) dataLine = line.slice(6);
        }
        if (!dataLine) continue;
        let parsed;
        try { parsed = JSON.parse(dataLine); } catch { continue; }
        if (eventName === 'geogebra' && parsed.geogebra) { geogebra = parsed.geogebra; onGeoGebra?.(geogebra); }
        else if (eventName === 'done') {
          if (parsed.session_id) sessionId = parsed.session_id;
          if (typeof parsed.is_refusal === 'boolean') isRefusal = parsed.is_refusal;
          if (!geogebra && parsed.geogebra) { geogebra = parsed.geogebra; onGeoGebra?.(geogebra); }
        }
        else if (eventName === 'error') throw new Error(parsed.error?.message || 'AI tutor error');
        else if (parsed.token) { full += parsed.token; onToken?.(parsed.token); }
      }
    }
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error('Stream interrupted'));
    return null;
  }
  if (!geogebra) {
    const ext = extractGeogebra(full);
    if (ext.geo) { geogebra = ext.geo; onGeoGebra?.(geogebra); full = ext.visible; }
  }
  onDone?.({ sessionId, isRefusal, geogebra });
  return { answer: full, session_id: sessionId, geogebra, is_refusal: isRefusal };
}

export async function getSessions() {
  if (USE_MOCK_DATA) return mockAISessions;
  const data = await get('/api/ai-tutor/sessions/');
  return data.results ?? data;
}

export async function fetchSession(id) {
  if (USE_MOCK_DATA) {
    const found = mockAISessions.find((s) => String(s.id) === String(id));
    return found ? { ...found, messages: [] } : null;
  }
  return get(`/api/ai-tutor/sessions/${id}/`);
}
