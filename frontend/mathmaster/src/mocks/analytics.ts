import type { AnalyticsSummary, WeeklyActivity, TopicPerformance, ScoreTrend, Recommendation, Attempt } from '@/types/learning';

export const mockAnalyticsSummary: AnalyticsSummary = {
  lessons_completed: 12,
  quizzes_taken: 8,
  avg_score: 78,
  current_streak: 5,
  longest_streak: 12,
  total_xp: 2400,
  level: 4,
  mastery: 62,
};

export const mockWeeklyActivity: WeeklyActivity[] = [
  { week: 'W1', lessons: 2, quizzes: 1 },
  { week: 'W2', lessons: 3, quizzes: 2 },
  { week: 'W3', lessons: 1, quizzes: 1 },
  { week: 'W4', lessons: 4, quizzes: 3 },
  { week: 'W5', lessons: 2, quizzes: 2 },
  { week: 'W6', lessons: 3, quizzes: 1 },
  { week: 'W7', lessons: 5, quizzes: 4 },
  { week: 'W8', lessons: 3, quizzes: 2 },
];

export const mockTopicPerformance: TopicPerformance[] = [
  { topic_id: 'topic-1', topic_name: 'Linear Equations', score: 85, lessons_total: 5, lessons_completed: 3 },
  { topic_id: 'topic-2', topic_name: 'Quadratic Functions', score: 45, lessons_total: 4, lessons_completed: 1 },
  { topic_id: 'topic-3', topic_name: 'Euclidean Geometry', score: 0, lessons_total: 6, lessons_completed: 0 },
  { topic_id: 'topic-4', topic_name: 'Introduction to Calculus', score: 72, lessons_total: 5, lessons_completed: 2 },
  { topic_id: 'topic-5', topic_name: 'Probability & Statistics', score: 90, lessons_total: 4, lessons_completed: 3 },
  { topic_id: 'topic-6', topic_name: 'Trigonometry Fundamentals', score: 95, lessons_total: 5, lessons_completed: 5 },
  { topic_id: 'topic-7', topic_name: 'Number Theory & Sequences', score: 68, lessons_total: 4, lessons_completed: 2 },
  { topic_id: 'topic-8', topic_name: 'Advanced Integration', score: 30, lessons_total: 5, lessons_completed: 1 },
];

export const mockScoreTrend: ScoreTrend[] = [
  { date: 'Aug 1', score: 60 },
  { date: 'Aug 4', score: 70 },
  { date: 'Aug 7', score: 65 },
  { date: 'Aug 10', score: 80 },
  { date: 'Aug 13', score: 75 },
  { date: 'Aug 16', score: 85 },
  { date: 'Aug 19', score: 90 },
  { date: 'Aug 22', score: 80 },
  { date: 'Aug 25', score: 95 },
  { date: 'Aug 28', score: 88 },
];

export const mockRecommendations: Recommendation[] = [
  { topic_id: 'topic-3', topic_name: 'Euclidean Geometry', reason: 'You haven\'t started this topic yet' },
  { topic_id: 'topic-2', topic_name: 'Quadratic Functions', reason: 'Continue where you left off' },
  { topic_id: 'topic-8', topic_name: 'Advanced Integration', reason: 'Based on your calculus progress' },
];

export const mockAttempts: Attempt[] = [
  {
    id: 'attempt-1',
    quiz_id: 'quiz-1-1',
    quiz_title: 'Linear Equations Basics',
    score: 4,
    total: 5,
    percentage: 80,
    xp_earned: 80,
    answers: [
      { question_id: 'q-1-1-1', question_text: 'Solve for x: 2x + 5 = 13', user_answer: 'x = 4', correct_answer: 'x = 4', is_correct: true, explanation: 'Subtract 5 from both sides: 2x = 8. Divide by 2: x = 4.' },
      { question_id: 'q-1-1-2', question_text: 'What is the slope of y = 3x - 7?', user_answer: '3', correct_answer: '3', is_correct: true, explanation: 'In y = mx + b, m is the slope. Here m = 3.' },
      { question_id: 'q-1-1-3', question_text: 'Solve: x - 8 = -3', user_answer: 'x = -5', correct_answer: 'x = 5', is_correct: false, explanation: 'Add 8 to both sides: x = -3 + 8 = 5.' },
      { question_id: 'q-1-1-4', question_text: 'What is the y-intercept of y = -2x + 6?', user_answer: '6', correct_answer: '6', is_correct: true, explanation: 'In y = mx + b, b is the y-intercept. Here b = 6.' },
      { question_id: 'q-1-1-5', question_text: 'Solve for x: 3x = 21', user_answer: '7', correct_answer: '7', is_correct: true, explanation: 'Divide both sides by 3: x = 21/3 = 7.' },
    ],
    created_at: '2026-08-28T14:30:00Z',
  },
  {
    id: 'attempt-2',
    quiz_id: 'quiz-4-1',
    quiz_title: 'Limits Quiz',
    score: 5,
    total: 5,
    percentage: 100,
    xp_earned: 100,
    answers: [
      { question_id: 'q-4-1-1', question_text: 'Evaluate: lim(x→2) (x² + 3)', user_answer: '7', correct_answer: '7', is_correct: true, explanation: 'Substitute x = 2: 4 + 3 = 7.' },
      { question_id: 'q-4-1-2', question_text: 'lim(x→0) (sin(x)/x) = ?', user_answer: '1', correct_answer: '1', is_correct: true, explanation: 'This is a fundamental limit: lim(x→0) sin(x)/x = 1.' },
      { question_id: 'q-4-1-3', question_text: 'If lim(x→a) f(x) = L, what does L represent?', user_answer: 'What f approaches near a', correct_answer: 'What f approaches near a', is_correct: true, explanation: 'A limit describes what the function approaches, not necessarily its value at the point.' },
      { question_id: 'q-4-1-4', question_text: 'lim(x→3) (x² - 9)/(x - 3) = ?', user_answer: '6', correct_answer: '6', is_correct: true, explanation: 'Factor: (x+3)(x-3)/(x-3) = x+3. At x=3: 6.' },
      { question_id: 'q-4-1-5', question_text: 'Evaluate: lim(x→1) (2x + 5)', user_answer: '7', correct_answer: '7', is_correct: true, explanation: 'Substitute x = 1: 2(1) + 5 = 7.' },
    ],
    created_at: '2026-08-25T10:00:00Z',
  },
  {
    id: 'attempt-3',
    quiz_id: 'quiz-6-1',
    quiz_title: 'Trig Ratios Quiz',
    score: 5,
    total: 5,
    percentage: 100,
    xp_earned: 100,
    answers: [
      { question_id: 'q-6-1-1', question_text: 'sin(θ) = ? / hypotenuse', user_answer: 'Opposite', correct_answer: 'Opposite', is_correct: true, explanation: 'SOH: sin = opposite / hypotenuse.' },
      { question_id: 'q-6-1-2', question_text: 'cos(θ) = ? / hypotenuse', user_answer: 'Adjacent', correct_answer: 'Adjacent', is_correct: true, explanation: 'CAH: cos = adjacent / hypotenuse.' },
      { question_id: 'q-6-1-3', question_text: 'tan(θ) = ? / adjacent', user_answer: 'Opposite', correct_answer: 'Opposite', is_correct: true, explanation: 'TOA: tan = opposite / adjacent.' },
      { question_id: 'q-6-1-4', question_text: 'SOH-CAH-TOA helps remember...', user_answer: 'Trig ratios', correct_answer: 'Trig ratios', is_correct: true, explanation: 'SOH-CAH-TOA is a mnemonic for sine, cosine, and tangent ratios.' },
      { question_id: 'q-6-1-5', question_text: 'In a right triangle, if opp=3 and hyp=5, find sin(θ).', user_answer: '3/5', correct_answer: '3/5', is_correct: true, explanation: 'sin(θ) = opposite / hypotenuse = 3/5.' },
    ],
    created_at: '2026-08-20T16:00:00Z',
  },
  {
    id: 'attempt-4',
    quiz_id: 'quiz-5-1',
    quiz_title: 'Descriptive Statistics',
    score: 5,
    total: 5,
    percentage: 100,
    xp_earned: 100,
    answers: [
      { question_id: 'q-5-1-1', question_text: 'Find the mean of: 4, 8, 6, 5, 7', user_answer: '6', correct_answer: '6', is_correct: true, explanation: '(4+8+6+5+7)/5 = 30/5 = 6.' },
      { question_id: 'q-5-1-2', question_text: 'Find the median of: 3, 7, 9, 1, 5', user_answer: '5', correct_answer: '5', is_correct: true, explanation: 'Sorted: 1, 3, 5, 7, 9. Middle value is 5.' },
      { question_id: 'q-5-1-3', question_text: 'The most frequent value in a data set is the...', user_answer: 'Mode', correct_answer: 'Mode', is_correct: true, explanation: 'The mode is the most frequently occurring value.' },
      { question_id: 'q-5-1-4', question_text: 'Range = ? - ?', user_answer: 'max - min', correct_answer: 'max - min', is_correct: true, explanation: 'Range is the maximum value minus the minimum value.' },
      { question_id: 'q-5-1-5', question_text: 'Find the mean of: 10, 20, 30', user_answer: '20', correct_answer: '20', is_correct: true, explanation: '(10+20+30)/3 = 60/3 = 20.' },
    ],
    created_at: '2026-08-18T11:00:00Z',
  },
  {
    id: 'attempt-5',
    quiz_id: 'quiz-1-2',
    quiz_title: 'Multi-Step Equations Quiz',
    score: 3,
    total: 5,
    percentage: 60,
    xp_earned: 60,
    answers: [
      { question_id: 'q-1-2-1', question_text: 'Solve: 3(x + 4) = 2x + 17', user_answer: 'x = 5', correct_answer: 'x = 5', is_correct: true, explanation: 'Distribute: 3x + 12 = 2x + 17. Subtract 2x: x + 12 = 17. Subtract 12: x = 5.' },
      { question_id: 'q-1-2-2', question_text: 'Solve: 5x - 3 = 2x + 12', user_answer: 'x = 3', correct_answer: 'x = 5', is_correct: false, explanation: 'Subtract 2x: 3x - 3 = 12. Add 3: 3x = 15. Divide by 3: x = 5.' },
      { question_id: 'q-1-2-3', question_text: 'Solve: 2(x - 3) + 4 = 3x - 5', user_answer: 'x = -1', correct_answer: 'x = -1', is_correct: true, explanation: 'Distribute: 2x - 6 + 4 = 3x - 5. Simplify: 2x - 2 = 3x - 5. Rearrange: x = -1.' },
      { question_id: 'q-1-2-4', question_text: 'Solve: 4x + 7 = 3(x + 2) + x', user_answer: 'x = 1', correct_answer: 'No solution', is_correct: false, explanation: 'Distribute: 4x + 7 = 3x + 6 + x = 4x + 6. Subtract 4x: 7 = 6, which is false.' },
      { question_id: 'q-1-2-5', question_text: 'Solve for x: 7x - 2 = 5x + 8', user_answer: '5', correct_answer: '5', is_correct: true, explanation: 'Subtract 5x: 2x - 2 = 8. Add 2: 2x = 10. Divide by 2: x = 5.' },
    ],
    created_at: '2026-08-15T09:00:00Z',
  },
];
