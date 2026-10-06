export type TeacherOverview = {
  topics_count: number;
  lessons_count: number;
  quizzes_count: number;
  students_count: number;
  new_students_this_week: number;
  coverage: number;
  active_students_7d: number;
};

export type TeacherStudent = {
  id: string;
  first_name: string;
  username: string;
  email: string;
  level: string;
  last_active: string;
  avg_score: number;
  total_attempts: number;
  lessons_completed: number;
  activity: { day: string; value: number }[];
};

export type StudentDetail = TeacherStudent & {
  score_trend: { date: string; score: number }[];
  topic_mastery: { topic_id: string; topic_name: string; score: number }[];
  recent_attempts: {
    id: string;
    quiz_id: string;
    quiz_title: string;
    score: number;
    total: number;
    percentage: number;
    created_at: string;
  }[];
  recommendations: { topic_id: string; topic_name: string; reason: string }[];
};

export type ContentActivity = {
  id: string;
  action: 'created' | 'updated' | 'deleted';
  item_type: 'topic' | 'lesson' | 'quiz' | 'question';
  item_name: string;
  created_at: string;
};

export type NotificationItem = {
  id: string;
  tone: 'brand' | 'warning' | 'danger' | 'success';
  title: string;
  description: string;
  created_at: string;
  read: boolean;
};

export type SearchResult = {
  id: string;
  type: 'topic' | 'lesson' | 'quiz' | 'student';
  title: string;
  subtitle: string;
  href: string;
};
