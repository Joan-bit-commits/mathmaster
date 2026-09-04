// Mock analytics data (student + teacher).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function mockStudentSummary(period = 'all') {
  await sleep(300);
  return {
    period,
    total_lessons_viewed: 24,
    lessons_completed: 18,
    quizzes_taken: 12,
    ai_questions_asked: 31,
    average_score: 74.5,
    topics_covered: 5,
    current_streak_days: 8,
    time_spent_minutes: 460,
  };
}

export const mockTopicPerformance = [
  { topic_id: 1, topic_name: 'Algebra', level: 'S1', average_score: 82, best_score: 100, attempts: 8 },
  { topic_id: 2, topic_name: 'Number & Numeration', level: 'S1', average_score: 91, best_score: 100, attempts: 5 },
  { topic_id: 3, topic_name: 'Geometry & Measurement', level: 'S2', average_score: 64, best_score: 85, attempts: 4 },
  { topic_id: 5, topic_name: 'Statistics & Probability', level: 'S3', average_score: 58, best_score: 75, attempts: 3 },
  { topic_id: 6, topic_name: 'Trigonometry', level: 'S3', average_score: 45, best_score: 60, attempts: 2 },
];

export const mockRecommendations = [
  { id: 1, topic: 6, topic_name: 'Trigonometry', recommendation_text: 'Revise "Trigonometry" — your average score is 45%. Work through the lessons and retry the quiz.', average_score: 45 },
  { id: 2, topic: 5, topic_name: 'Statistics & Probability', recommendation_text: 'Revise "Statistics & Probability" — your average score is 58%.', average_score: 58 },
];

export const mockTeacherOverview = {
  total_students: 86,
  active_7d: 54,
  active_30d: 78,
  top_struggling_topics: [
    { topic_id: 7, topic_name: 'Matrices & Transformation', average_score: 41.2, attempts: 30 },
    { topic_id: 6, topic_name: 'Trigonometry', average_score: 47.8, attempts: 42 },
  ],
  score_distribution: { '0-49': 18, '50-59': 22, '60-69': 25, '70-79': 20, '80-89': 15, '90-100': 12 },
  coverage: { topics: 24, lessons: 48, quizzes: 48 },
};

export const mockTeacherStudents = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: ['Aisha N.', 'Brian K.', 'Cynthia A.', 'David O.', 'Esther M.', 'Frank S.', 'Grace T.', 'Henry W.', 'Irene P.', 'James L.', 'Keisha B.', 'Ronald D.'][i],
  level: ['S2', 'S3', 'S4'][i % 3],
  average_score: 45 + ((i * 13) % 50),
  last_active: new Date(Date.now() - (i % 7) * 86400000).toISOString(),
  trend: Array.from({ length: 7 }, (_, d) => 40 + ((i * 7 + d * 5) % 45)),
}));
