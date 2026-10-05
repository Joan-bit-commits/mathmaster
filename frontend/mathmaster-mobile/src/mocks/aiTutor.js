// Mock AI tutor data with strict-mode + GeoGebra 2D/3D support.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const REFUSAL_PHRASE = "I'm sorry, but I can only help with mathematics.";

export const mockAISessions = [
  { id: 1, title: 'Solving 2x + 5 = 13', topic: 'Algebra', updated_at: new Date().toISOString(), message_count: 4 },
  { id: 2, title: 'Area of a trapezium', topic: 'Geometry & Measurement', updated_at: new Date(Date.now() - 86400000).toISOString(), message_count: 6 },
  { id: 3, title: 'Probability of dice', topic: 'Statistics & Probability', updated_at: new Date(Date.now() - 3 * 86400000).toISOString(), message_count: 2 },
];

function isMathQuestion(q) {
  const ql = (q || '').toLowerCase();
  if (ql.includes('joke') || ql.includes('weather') || ql.includes('news') || ql.includes('recipe') || ql.includes('movie') || ql.includes('song') || ql.includes('poem') || ql.includes('story')) return false;
  return true;
}

function mockGeogebraFor(question) {
  const ql = (question || '').toLowerCase();
  if (ql.includes('sphere') || ql.includes('3d') || ql.includes('radius 3')) {
    return { view: '3D', title: 'Sphere of radius 3 centered at origin', commands: ['Sphere((0,0,0), 3)', 'Point((0,0,3))', 'Point((3,0,0))'], x_label: 'x', y_label: 'y', z_label: 'z' };
  }
  if (ql.includes('parabola') || ql.includes('x^2') || ql.includes('x²') || ql.includes('quadratic')) {
    return { view: '2D', title: 'y = x² — the basic parabola', commands: ['f(x) = x^2', 'Vertex((0, 0))'], axes: true, grid: true, x_min: -5, x_max: 5, y_min: -2, y_max: 10 };
  }
  if (ql.includes('triangle') || ql.includes('pythagorean') || ql.includes('3-4-5')) {
    return { view: '2D', title: 'Right triangle 3-4-5', commands: ['A = (0, 0)', 'B = (3, 0)', 'C = (0, 4)', 'Polygon(A, B, C)'], axes: true, grid: true, x_min: -1, x_max: 6, y_min: -1, y_max: 6 };
  }
  if (ql.includes('derivative') || ql.includes('sin') || ql.includes('cos')) {
    return { view: '2D', title: "f(x) = x² and f'(x) = 2x", commands: ['f(x) = x^2', 'g(x) = 2x', 'Tangent((1, f(1)))'], axes: true, grid: true, x_min: -5, x_max: 5, y_min: -5, y_max: 10 };
  }
  return null;
}

const mockAnswers = {
  math: (question) => `# Concept\n\nLet's work through **${question || 'your question'}** step by step.\n\n# Step-by-Step Solution\n\n**Step 1:** Write down what is given.\n\n**Step 2:** Isolate the unknown.\n\n**Step 3:** Simplify to find the answer.\n\n# Final Answer\n\nx = 4\n\n# Key Takeaway\n\nAlways keep the equation balanced.\n\n# Practice Question\n\nSolve: 3x - 5 = 10`,
  refusal: REFUSAL_PHRASE + " If you have a math problem — algebra, geometry, trigonometry, calculus, statistics, or any other math topic — I'd be happy to help. Please ask me a math question.",
};

export async function mockAskAI({ topic = 'Algebra', question }) {
  await sleep(500);
  const isMath = isMathQuestion(question);
  return {
    session_id: 1,
    topic,
    answer: isMath ? mockAnswers.math(question) : mockAnswers.refusal,
    geogebra: isMath ? mockGeogebraFor(question) : null,
    is_refusal: !isMath,
    cached: false,
  };
}

const GEOGEBRA_TAG_RE_LOCAL = /\n\[GEOGEBRA_DATA:\s*(\{.*?\})\s*\]\s*$/s;
function extractFromText(text) {
  if (!text) return { visible: text, geo: null };
  const match = text.match(GEOGEBRA_TAG_RE_LOCAL);
  if (!match) return { visible: text, geo: null };
  const visible = text.slice(0, match.index).trimEnd();
  try {
    const parsed = JSON.parse(match[1]);
    if (parsed.view !== '2D' && parsed.view !== '3D') return { visible, geo: null };
    if (!Array.isArray(parsed.commands)) return { visible, geo: null };
    return { visible, geo: parsed };
  } catch { return { visible, geo: null }; }
}

export async function mockAskAIStream({ question, topic = 'Algebra' }) {
  const isMath = isMathQuestion(question);
  const answer = isMath ? mockAnswers.math(question) : mockAnswers.refusal;
  const geogebra = isMath ? mockGeogebraFor(question) : null;
  const { visible } = extractFromText(answer);
  return { visible, geo: geogebra, isRefusal: !isMath };
}
