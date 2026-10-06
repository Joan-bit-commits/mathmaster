export type Level = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'University';

export type Subject = 'Algebra' | 'Geometry' | 'Calculus' | 'Statistics' | 'Trigonometry' | 'Number Theory';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type Topic = {
  id: string;
  name: string;
  description: string;
  level: Level;
  subject: Subject;
  icon: string;
  color: string;
  lessons_count: number;
  quizzes_count: number;
  estimated_hours: number;
  progress: number;
  lessons_completed: number;
  created_at: string;
};

export type Lesson = {
  id: string;
  topic_id: string;
  title: string;
  description: string;
  content: string;
  duration_minutes: number;
  difficulty: Difficulty;
  order: number;
  completed: boolean;
};

export type Question = {
  id: string;
  quiz_id: string;
  text: string;
  type: 'multiple_choice' | 'short_answer';
  choices?: string[];
  correct_answer: string;
  explanation: string;
  order: number;
};

export type Quiz = {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  questions_count: number;
  best_score: number | null;
  attempted: boolean;
};

export type Attempt = {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total: number;
  percentage: number;
  xp_earned: number;
  answers: AttemptAnswer[];
  created_at: string;
};

export type AttemptAnswer = {
  question_id: string;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
};

export type AISession = {
  id: string;
  topic: string;
  preview: string;
  message_count: number;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  geogebra?: GeoGebraPayload | null;
  is_refusal?: boolean;
};

// ─── AI Tutor v2: strict mode + GeoGebra ──────────────────────────

export type GeoGebraPayload = {
  view: '2D' | '3D';
  title: string;
  commands: string[];
  axes?: boolean;
  grid?: boolean;
  x_min?: number;
  x_max?: number;
  y_min?: number;
  y_max?: number;
  x_label?: string;
  y_label?: string;
  z_label?: string;
};

export type AITutorResponse = {
  session_id: string | null;
  topic: string;
  level: string;
  answer: string;
  geogebra: GeoGebraPayload | null;
  cached: boolean;
  is_refusal: boolean;
};

export const REFUSAL_PHRASE =
  "I'm sorry, but I can only help with mathematics.";

export type AnalyticsSummary = {
  lessons_completed: number;
  quizzes_taken: number;
  avg_score: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
  mastery: number;
};

export type WeeklyActivity = {
  week: string;
  lessons: number;
  quizzes: number;
};

export type TopicPerformance = {
  topic_id: string;
  topic_name: string;
  score: number;
  lessons_total: number;
  lessons_completed: number;
};

export type ScoreTrend = {
  date: string;
  score: number;
};

export type Recommendation = {
  topic_id: string;
  topic_name: string;
  reason: string;
};
