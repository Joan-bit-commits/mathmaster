import type { TeacherOverview, TeacherStudent, StudentDetail, ContentActivity, NotificationItem } from '@/types/teacher';

export const mockTeacherOverview: TeacherOverview = {
  topics_count: 8,
  lessons_count: 38,
  quizzes_count: 20,
  students_count: 124,
  new_students_this_week: 7,
  coverage: 87,
  active_students_7d: 89,
};

const firstNames = ['Alice', 'Brian', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Karen', 'Leo'];
const levels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
const usernames = ['mathwiz', 'algebra_ace', 'geo_genius', 'calc_kid', 'stat_star', 'trig_titan', 'num_ninja', 'prime_pupil', 'data_diva', 'func_fan', 'eqn_expert', 'shape_scholar'];

function generateActivity(seed: number): { day: string; value: number }[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({ day, value: ((seed + i * 3) % 5) + 1 }));
}

export const mockTeacherStudents: TeacherStudent[] = firstNames.map((name, i) => ({
  id: `student-${i + 1}`,
  first_name: name,
  username: usernames[i],
  email: `${name.toLowerCase()}@school.edu`,
  level: levels[i % levels.length],
  last_active: new Date(Date.now() - i * 3600_000 * (i + 1)).toISOString(),
  avg_score: 55 + ((i * 7) % 45),
  total_attempts: 8 + (i * 3) % 20,
  lessons_completed: 3 + (i * 2) % 12,
  activity: generateActivity(i + 1),
}));

export const mockStudentDetail: StudentDetail = {
  ...mockTeacherStudents[0],
  score_trend: [
    { date: 'Aug 3', score: 55 },
    { date: 'Aug 6', score: 62 },
    { date: 'Aug 9', score: 58 },
    { date: 'Aug 12', score: 70 },
    { date: 'Aug 15', score: 75 },
    { date: 'Aug 18', score: 68 },
    { date: 'Aug 21', score: 80 },
    { date: 'Aug 24', score: 85 },
    { date: 'Aug 27', score: 78 },
    { date: 'Aug 30', score: 88 },
  ],
  topic_mastery: [
    { topic_id: 'topic-1', topic_name: 'Linear Equations', score: 85 },
    { topic_id: 'topic-2', topic_name: 'Quadratic Functions', score: 45 },
    { topic_id: 'topic-3', topic_name: 'Euclidean Geometry', score: 30 },
    { topic_id: 'topic-4', topic_name: 'Intro to Calculus', score: 72 },
    { topic_id: 'topic-5', topic_name: 'Probability & Stats', score: 90 },
    { topic_id: 'topic-6', topic_name: 'Trigonometry', score: 65 },
  ],
  recent_attempts: [
    { id: 'sa-1', quiz_id: 'quiz-1-1', quiz_title: 'Linear Equations Basics', score: 4, total: 5, percentage: 80, created_at: '2026-08-30T14:00:00Z' },
    { id: 'sa-2', quiz_id: 'quiz-5-1', quiz_title: 'Descriptive Statistics', score: 5, total: 5, percentage: 100, created_at: '2026-08-28T10:00:00Z' },
    { id: 'sa-3', quiz_id: 'quiz-4-1', quiz_title: 'Limits Quiz', score: 3, total: 5, percentage: 60, created_at: '2026-08-25T16:00:00Z' },
    { id: 'sa-4', quiz_id: 'quiz-1-2', quiz_title: 'Multi-Step Equations', score: 4, total: 5, percentage: 80, created_at: '2026-08-22T09:00:00Z' },
    { id: 'sa-5', quiz_id: 'quiz-6-1', quiz_title: 'Trig Ratios Quiz', score: 5, total: 5, percentage: 100, created_at: '2026-08-20T11:00:00Z' },
  ],
  recommendations: [
    { topic_id: 'topic-3', topic_name: 'Euclidean Geometry', reason: 'Low mastery — recommend focused practice' },
    { topic_id: 'topic-2', topic_name: 'Quadratic Functions', reason: 'Below average — needs reinforcement' },
    { topic_id: 'topic-4', topic_name: 'Intro to Calculus', reason: 'Ready for advanced topics' },
  ],
};

export const mockContentActivity: ContentActivity[] = [
  { id: 'ca-1', action: 'created', item_type: 'quiz', item_name: 'Limits Quiz', created_at: new Date(Date.now() - 3600_000).toISOString() },
  { id: 'ca-2', action: 'updated', item_type: 'lesson', item_name: 'Derivatives: Rate of Change', created_at: new Date(Date.now() - 7200_000).toISOString() },
  { id: 'ca-3', action: 'created', item_type: 'question', item_name: 'Evaluate: lim(x→2)(x²+3)', created_at: new Date(Date.now() - 86400_000).toISOString() },
  { id: 'ca-4', action: 'created', item_type: 'topic', item_name: 'Advanced Integration', created_at: new Date(Date.now() - 172800_000).toISOString() },
  { id: 'ca-5', action: 'updated', item_type: 'quiz', item_name: 'Linear Equations Basics', created_at: new Date(Date.now() - 259200_000).toISOString() },
  { id: 'ca-6', action: 'created', item_type: 'lesson', item_name: 'The Quadratic Formula', created_at: new Date(Date.now() - 345600_000).toISOString() },
  { id: 'ca-7', action: 'deleted', item_type: 'question', item_name: 'Old question draft', created_at: new Date(Date.now() - 432000_000).toISOString() },
  { id: 'ca-8', action: 'updated', item_type: 'topic', item_name: 'Trigonometry Fundamentals', created_at: new Date(Date.now() - 518400_000).toISOString() },
  { id: 'ca-9', action: 'created', item_type: 'lesson', item_name: 'SOH-CAH-TOA', created_at: new Date(Date.now() - 604800_000).toISOString() },
  { id: 'ca-10', action: 'created', item_type: 'quiz', item_name: 'Descriptive Statistics', created_at: new Date(Date.now() - 691200_000).toISOString() },
];

export const mockNotifications: NotificationItem[] = [
  { id: 'n-1', tone: 'brand', title: 'New student enrolled', description: 'Jack joined your S3 Mathematics class', created_at: new Date(Date.now() - 1800_000).toISOString(), read: false },
  { id: 'n-2', tone: 'success', title: 'Quiz completed', description: '12 students completed "Limits Quiz" with 85% average', created_at: new Date(Date.now() - 7200_000).toISOString(), read: false },
  { id: 'n-3', tone: 'warning', title: 'Content gap detected', description: 'Euclidean Geometry has no quizzes assigned', created_at: new Date(Date.now() - 14400_000).toISOString(), read: false },
  { id: 'n-4', tone: 'brand', title: 'New student enrolled', description: 'Karen joined your S1 Mathematics class', created_at: new Date(Date.now() - 86400_000).toISOString(), read: false },
  { id: 'n-5', tone: 'danger', title: 'Low performance alert', description: 'Brian scored below 40% on 3 consecutive quizzes', created_at: new Date(Date.now() - 90000_000).toISOString(), read: true },
  { id: 'n-6', tone: 'success', title: 'Topic published', description: 'Advanced Integration Techniques is now live', created_at: new Date(Date.now() - 172800_000).toISOString(), read: true },
  { id: 'n-7', tone: 'brand', title: 'Weekly report ready', description: 'Your teaching analytics for last week are available', created_at: new Date(Date.now() - 259200_000).toISOString(), read: true },
];
