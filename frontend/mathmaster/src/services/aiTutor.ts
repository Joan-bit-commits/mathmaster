import type { AISession, ChatMessage, AITutorResponse, GeoGebraPayload } from '@/types/learning';
import { get, post, del } from '@/lib/api';
import { API_BASE } from '@/lib/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const REFUSAL_PHRASE = "I'm sorry, but I can only help with mathematics.";

const GEOGEBRA_TAG_RE = /\n\[GEOGEBRA_DATA:\s*(\{.*?\})\s*\]\s*$/s;
function extractGeogebra(text: string): { visible: string; geo: GeoGebraPayload | null } {
  if (!text) return { visible: text, geo: null };
  const match = text.match(GEOGEBRA_TAG_RE);
  if (!match) return { visible: text, geo: null };
  const visible = text.slice(0, match.index).trimEnd();
  try {
    const parsed = JSON.parse(match[1]);
    if (parsed.view !== '2D' && parsed.view !== '3D') return { visible, geo: null };
    if (!Array.isArray(parsed.commands)) return { visible, geo: null };
    return { visible, geo: parsed as GeoGebraPayload };
  } catch { return { visible, geo: null }; }
}
function isRefusal(text: string): boolean {
  if (!text) return false;
  const { visible } = extractGeogebra(text);
  return visible.toLowerCase().includes(REFUSAL_PHRASE.toLowerCase());
}

const mockResponses: Record<string, string> = {
  quadratic: `Great question! Let's break down **quadratic equations** step by step.

A quadratic equation has the form:

\`\`\`
ax² + bx + c = 0
\`\`\`

## Methods to Solve

1. **Factoring** — if the expression can be factored
2. **Quadratic formula** — works for all quadratics
3. **Completing the square** — a useful algebraic technique

## The Quadratic Formula

\`\`\`
x = (-b ± √(b² - 4ac)) / 2a
\`\`\`

The discriminant **b² - 4ac** tells you:
- Positive → two real solutions
- Zero → one real solution
- Negative → two complex solutions

## Example

Solve **x² - 5x + 6 = 0**:
- Factoring: (x-2)(x-3) = 0
- Solutions: x = 2 or x = 3

Would you like to try a practice problem?`,
  pythagorean: `The **Pythagorean Theorem** is one of the most important results in mathematics.

## The Theorem

In a right triangle with legs **a** and **b**, and hypotenuse **c**:

\`\`\`
a² + b² = c²
\`\`\`

## Example

If a = 3 and b = 4:
\`\`\`
c = √(9 + 16) = √25 = 5
\`\`\`

## Key Points

- Only works for **right triangles**
- The hypotenuse is always the **longest side**
- Used in navigation, construction, and physics

Would you like to see more examples?`,
  derivative: `Let's explore **derivatives** — the heart of calculus!

## What is a Derivative?

A derivative measures the **instantaneous rate of change** of a function.

## The Power Rule

\`\`\`
d/dx [xⁿ] = n · xⁿ⁻¹
\`\`\`

## Examples

- d/dx [x²] = 2x
- d/dx [x³] = 3x²
- d/dx [5x] = 5
- d/dx [7] = 0

## What It Means

The derivative gives you the **slope of the tangent line** at any point on the curve.`,
  sphere: `Let's visualize a **sphere** of radius $r$ centered at the origin.

The equation is $x^2 + y^2 + z^2 = r^2$.

Every point on the surface is exactly $r$ units from the center.`,
  default: `I'm here to help with any math question! Here's what I can assist with:

- **Algebra** — equations, inequalities, factoring
- **Geometry** — angles, triangles, circles
- **Calculus** — limits, derivatives, integrals
- **Statistics** — probability, distributions
- **Trigonometry** — sine, cosine, tangent

Try asking me something like:
1. "Explain quadratic equations"
2. "Help me solve 2x + 5 = 13"
3. "What's the Pythagorean theorem?"

What would you like to explore?`,
  refusal: REFUSAL_PHRASE + " If you have a math problem — algebra, geometry, trigonometry, calculus, statistics, or any other math topic — I'd be happy to help. Please ask me a math question.",
};

function getMockResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('quadratic') || q.includes('parabola')) return mockResponses.quadratic;
  if (q.includes('pythagorean') || q.includes('triangle')) return mockResponses.pythagorean;
  if (q.includes('derivative') || q.includes('calculus') || q.includes('differentiat')) return mockResponses.derivative;
  if (q.includes('sphere') || q.includes('3d')) return mockResponses.sphere;
  if (q.includes('joke') || q.includes('weather') || q.includes('news') || q.includes('recipe') || q.includes('movie')) {
    return mockResponses.refusal;
  }
  return mockResponses.default;
}

function getMockGeogebra(question: string): GeoGebraPayload | null {
  const q = question.toLowerCase();
  if (q.includes('sphere') || q.includes('3d')) {
    return { view: '3D', title: 'Sphere of radius 3', commands: ['Sphere((0,0,0), 3)', 'Point((0,0,3))', 'Point((3,0,0))'], x_label: 'x', y_label: 'y', z_label: 'z' };
  }
  if (q.includes('quadratic') || q.includes('parabola') || q.includes('x^2')) {
    return { view: '2D', title: 'y = x²', commands: ['f(x) = x^2', 'Vertex((0, 0))'], axes: true, grid: true, x_min: -5, x_max: 5, y_min: -2, y_max: 10 };
  }
  if (q.includes('pythagorean') || q.includes('triangle')) {
    return { view: '2D', title: 'Right triangle 3-4-5', commands: ['A = (0, 0)', 'B = (3, 0)', 'C = (0, 4)', 'Polygon(A, B, C)'], axes: true, grid: true, x_min: -1, x_max: 6, y_min: -1, y_max: 6 };
  }
  return null;
}

export async function askAI(params: { session_id?: string; topic: string; question: string; level?: string; context?: string }): Promise<AITutorResponse & { response: string }> {
  if (USE_MOCKS) {
    await delay(800);
    const full = getMockResponse(params.question);
    const { visible, geo } = extractGeogebra(full);
    const mockGeo = geo ?? getMockGeogebra(params.question);
    return {
      session_id: params.session_id ?? `session-${Date.now()}`,
      topic: params.topic, level: params.level || 'S1', answer: visible, response: visible,
      geogebra: mockGeo, cached: false, is_refusal: isRefusal(full),
    };
  }
  const res = await post<AITutorResponse>('/api/ai-tutor/ask-ai-tutor/', params);
  return { ...res, response: res.answer };
}

export interface AskAIStreamCallbacks {
  onToken: (token: string) => void;
  onGeoGebra?: (payload: GeoGebraPayload) => void;
  onDone?: (info: { fullText: string; sessionId: string; isRefusal: boolean; geogebra: GeoGebraPayload | null; cached?: boolean }) => void;
  onError?: (error: Error) => void;
}

export async function askAIStream(
  params: { session_id?: string; topic: string; question: string; level?: string; context?: string },
  callbacks: AskAIStreamCallbacks
): Promise<void> {
  const { onToken, onGeoGebra, onDone, onError } = callbacks;
  if (USE_MOCKS) {
    try {
      const full = getMockResponse(params.question);
      const sessionId = params.session_id ?? `session-${Date.now()}`;
      const { visible } = extractGeogebra(full);
      const mockGeo = getMockGeogebra(params.question);
      const tokens = visible.match(/\S+\s*/g) ?? [visible];
      for (const t of tokens) { await delay(20 + Math.random() * 40); onToken(t); }
      if (mockGeo) onGeoGebra?.(mockGeo);
      onDone?.({ fullText: visible, sessionId, isRefusal: isRefusal(full), geogebra: mockGeo, cached: false });
    } catch (err) { onError?.(err instanceof Error ? err : new Error('Stream failed')); }
    return;
  }
  try {
    const { useAuthStore } = await import('@/stores/authStore');
    const { getSchoolId } = await import('@/lib/api');
    const accessToken = useAuthStore.getState().accessToken;
    const schoolId = getSchoolId();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    if (schoolId) headers['X-School-Id'] = schoolId;
    const res = await fetch(`${API_BASE}/api/ai-tutor/ask-ai-tutor/stream/`, {
      method: 'POST', headers,
      body: JSON.stringify(params),
    });
    if (!res.ok || !res.body) throw new Error('Stream request failed');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '', fullText = '', sessionId = params.session_id ?? '', isRefusal = false, geogebra: GeoGebraPayload | null = null, emittedLen = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n'); buffer = blocks.pop() ?? '';
      for (const block of blocks) {
        let eventName = 'message', dataLine: string | null = null;
        for (const line of block.split('\n')) {
          if (line.startsWith('event: ')) eventName = line.slice(7).trim();
          else if (line.startsWith('data: ')) dataLine = line.slice(6);
        }
        if (!dataLine) continue;
        let parsed: any; try { parsed = JSON.parse(dataLine); } catch { continue; }
        if (eventName === 'geogebra' && parsed.geogebra) { geogebra = parsed.geogebra; if (geogebra) onGeoGebra?.(geogebra); }
        else if (eventName === 'done') {
          if (parsed.session_id) sessionId = parsed.session_id;
          if (typeof parsed.is_refusal === 'boolean') isRefusal = parsed.is_refusal;
          if (!geogebra && parsed.geogebra) { geogebra = parsed.geogebra; if (geogebra) onGeoGebra?.(geogebra); }
        }
        else if (eventName === 'error') { onError?.(new Error(parsed.error?.message || 'AI tutor error')); return; }
        else if (parsed.token) {
          fullText += parsed.token;
          // Suppress the raw [GEOGEBRA_DATA: ...] tag while streaming: the
          // backend emits it as trailing tokens and the sketch arrives
          // separately via the geogebra event, so the tag must never render.
          const tagIdx = fullText.indexOf('[GEOGEBRA_DATA');
          const visibleLen = tagIdx === -1 ? fullText.length : tagIdx;
          if (visibleLen > emittedLen) {
            onToken(fullText.slice(emittedLen, visibleLen));
            emittedLen = visibleLen;
          }
        }
      }
    }
    if (!geogebra) {
      const ext = extractGeogebra(fullText);
      if (ext.geo) { geogebra = ext.geo; onGeoGebra?.(geogebra); fullText = ext.visible; }
    }
    onDone?.({ fullText, sessionId, isRefusal, geogebra });
  } catch (err) { onError?.(err instanceof Error ? err : new Error('Stream failed')); }
}

export async function getSessions(): Promise<AISession[]> {
  if (USE_MOCKS) {
    await delay(200);
    return [
      { id: 'session-1', topic: 'Quadratic Equations', preview: 'How do I solve x² - 5x + 6?', message_count: 4, created_at: '2026-08-28T14:00:00Z' },
      { id: 'session-2', topic: 'Calculus', preview: 'What is a derivative?', message_count: 6, created_at: '2026-08-27T10:00:00Z' },
      { id: 'session-3', topic: 'Trigonometry', preview: 'Explain the unit circle', message_count: 3, created_at: '2026-08-25T16:00:00Z' },
    ];
  }
  // Global DRF pagination wraps the list as {count, next, previous, results}.
  const data = await get<unknown>('/api/ai-tutor/sessions/');
  const items = Array.isArray(data) ? data : (data as { results?: unknown[] })?.results ?? [];
  return (items as any[]).map((s) => ({
    id: String(s.id),
    topic: s.topic ?? '',
    preview: s.preview ?? s.title ?? '',
    message_count: s.message_count ?? 0,
    created_at: s.created_at ?? '',
  }));
}
export async function getSession(id: string): Promise<{ session: AISession; messages: ChatMessage[] }> {
  if (USE_MOCKS) {
    await delay(200);
    return {
      session: { id, topic: 'Quadratic Equations', preview: 'How do I solve x² - 5x + 6?', message_count: 4, created_at: '2026-08-28T14:00:00Z' },
      messages: [
        { id: 'm1', session_id: id, role: 'user', content: 'How do I solve x² - 5x + 6?', created_at: '2026-08-28T14:00:00Z', geogebra: null, is_refusal: false },
        { id: 'm2', session_id: id, role: 'assistant', content: mockResponses.quadratic, created_at: '2026-08-28T14:01:00Z', geogebra: getMockGeogebra('quadratic'), is_refusal: false },
      ],
    };
  }
  return get(`/api/ai-tutor/sessions/${id}/`);
}
export async function deleteSession(id: string): Promise<void> {
  if (USE_MOCKS) {
    await delay(200);
    return;
  }
  await del(`/api/ai-tutor/sessions/${id}/`);
}
