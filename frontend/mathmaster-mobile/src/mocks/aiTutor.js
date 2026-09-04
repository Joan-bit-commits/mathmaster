// Mock AI tutor data.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockAISessions = [
  { id: 1, title: 'Solving 2x + 5 = 13', topic: 'Algebra', updated_at: new Date().toISOString(), message_count: 4 },
  { id: 2, title: 'Area of a trapezium', topic: 'Geometry & Measurement', updated_at: new Date(Date.now() - 86400000).toISOString(), message_count: 6 },
  { id: 3, title: 'Probability of dice', topic: 'Statistics & Probability', updated_at: new Date(Date.now() - 3 * 86400000).toISOString(), message_count: 2 },
];

export async function mockAskAI({ topic = 'Algebra', question }) {
  await sleep(500);
  return {
    session_id: 1,
    topic,
    answer:
      `# Concept\n\nLet's work through **${question || 'your question'}** step by step.\n\n` +
      `# Step-by-Step Solution\n\n**Step 1:** Write down what is given.\n\n` +
      `**Step 2:** Isolate the unknown by doing the same operation on both sides.\n\n` +
      `**Step 3:** Simplify to find the answer.\n\n` +
      `# Final Answer\n\nx = 4\n\n` +
      `# Key Takeaway\n\nAlways keep the equation balanced.\n\n` +
      `# Practice Question\n\nSolve: 3x - 5 = 10`,
  };
}
