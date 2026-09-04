// Mock teacher authoring responses.
export async function mockCreate(kind, payload) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: Math.floor(Math.random() * 1000) + 100, ...payload };
}
