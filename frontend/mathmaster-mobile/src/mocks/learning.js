// Mock learning content: 8 topics, 20 lessons, 15 quizzes, questions per quiz.
const LEVELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'UNIVERSITY'];

const TOPICS = [
  { id: 1, name: 'Algebra', description: 'Equations, expressions, inequalities and formulae.', level: 'S1', subject: 'Mathematics', progress: 60 },
  { id: 2, name: 'Number & Numeration', description: 'Number bases, indices, standard form and ratios.', level: 'S1', subject: 'Mathematics', progress: 100 },
  { id: 3, name: 'Geometry & Measurement', description: 'Angles, polygons, constructions, area and volume.', level: 'S2', subject: 'Mathematics', progress: 30 },
  { id: 4, name: 'Sets', description: 'Set notation, Venn diagrams and set operations.', level: 'S1', subject: 'Mathematics', progress: 0 },
  { id: 5, name: 'Statistics & Probability', description: 'Data collection, charts, averages and probability.', level: 'S3', subject: 'Mathematics', progress: 45 },
  { id: 6, name: 'Trigonometry', description: 'Sine, cosine and tangent ratios and applications.', level: 'S3', subject: 'Mathematics', progress: 10 },
  { id: 7, name: 'Matrices & Transformation', description: 'Matrix operations, determinants and transformations.', level: 'S4', subject: 'Mathematics', progress: 0 },
  { id: 8, name: 'Vectors & Mechanics', description: 'Scalars, vectors and their applications.', level: 'S5', subject: 'Mathematics', progress: 0 },
];

const LESSONS = [];
TOPICS.forEach((topic, ti) => {
  for (let li = 1; li <= (ti < 6 ? 3 : 1); li++) {
    LESSONS.push({
      id: topic.id * 10 + li,
      topic: topic.id,
      title: `${topic.name} — Lesson ${li}`,
      content:
        `## Concept\n\n${topic.description} Lesson ${li} builds on the previous session with worked examples.\n\n` +
        `## Step-by-Step\n\n1. Read the problem carefully.\n2. Identify what is given and what is asked.\n3. Choose the right method.\n4. Solve and check your answer.\n\n` +
        `### Formula\n\n\`\`\`\nx = (-b ± √(b² - 4ac)) / 2a\n\`\`\`\n\n` +
        `## Practice\n\nTry the quiz to test your understanding!`,
      order: li,
      duration_minutes: 15 + li * 5,
    });
  }
});

const QUIZZES = [];
LESSONS.forEach((lesson, i) => {
  QUIZZES.push({
    id: i + 1,
    lesson: lesson.id,
    title: `${lesson.title} Quiz`,
    description: `Check your understanding of ${lesson.title.toLowerCase()}.`,
    question_count: 5,
  });
});

const QUESTIONS = {};
QUIZZES.forEach((quiz) => {
  QUESTIONS[quiz.id] = Array.from({ length: 5 }, (_, qi) => ({
    id: quiz.id * 10 + qi,
    quiz: quiz.id,
    question_text: `Sample question ${qi + 1}: If 2x + ${qi + 3} = ${2 * 4 + qi + 3}, what is x?`,
    choices: ['1', '2', '3', '4'],
    correct_answer: '4',
  }));
});

const ATTEMPTS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  quiz: (i % 15) + 1,
  quiz_title: QUIZZES[i % 15]?.title || 'Quiz',
  score: [40, 55, 60, 70, 75, 80, 85, 90, 95, 100][i % 10],
  attempted_at: new Date(Date.now() - i * 86400000).toISOString(),
}));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function mockTopics({ level, subject } = {}) {
  await sleep(300);
  return TOPICS.filter(
    (t) => (!level || t.level === level) && (!subject || t.subject === subject)
  );
}

export async function mockTopic(id) {
  await sleep(200);
  return TOPICS.find((t) => t.id === Number(id)) || TOPICS[0];
}

export async function mockLessons(topicId) {
  await sleep(300);
  return LESSONS.filter((l) => l.topic === Number(topicId));
}

export async function mockLesson(id) {
  await sleep(200);
  return LESSONS.find((l) => l.id === Number(id)) || LESSONS[0];
}

export async function mockQuizzes(lessonId) {
  await sleep(300);
  return QUIZZES.filter((q) => q.lesson === Number(lessonId));
}

export async function mockQuiz(id) {
  await sleep(200);
  return QUIZZES.find((q) => q.id === Number(id)) || QUIZZES[0];
}

export async function mockQuestions(quizId) {
  await sleep(300);
  return QUESTIONS[Number(quizId)] || QUESTIONS[1];
}

export async function mockAttempt(quizId, answers) {
  await sleep(600);
  const qs = QUESTIONS[Number(quizId)] || QUESTIONS[1];
  let correct = 0;
  const byId = Object.fromEntries(qs.map((q) => [q.id, q]));
  for (const a of answers || []) {
    if (byId[a.question] && String(byId[a.question].correct_answer).toLowerCase() === String(a.answer).toLowerCase()) {
      correct += 1;
    }
  }
  const total = answers?.length || qs.length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  return { id: Date.now(), quiz: Number(quizId), score, xp_earned: Math.round(score / 2) };
}

export { TOPICS, LESSONS, QUIZZES, QUESTIONS, ATTEMPTS, LEVELS };
