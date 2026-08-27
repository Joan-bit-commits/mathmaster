import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const STORAGE_KEYS = {
  activities: 'mathmaster-student-activities',
  reminders: 'mathmaster-student-reminders',
  evaluationRequests: 'mathmaster-student-evaluation-requests',
  endorsements: 'mathmaster-student-endorsements',
  settings: 'mathmaster-student-settings',
};

const CANONICAL_MATH_TOPICS = ['Algebra', 'Geometry', 'Statistics', 'Trigonometry', 'Calculus'];

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function readStoredValue(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function formatDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDateKey(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return formatDateKey(date);
}

function combineActivityDates(attempts, savedActivities) {
  const attemptDates = attempts.map((attempt) => toDateKey(attempt.attempted_at)).filter(Boolean);
  const activityDates = savedActivities.map((activity) => toDateKey(activity.createdAt)).filter(Boolean);
  return [...attemptDates, ...activityDates];
}

function countStreakDays(dates) {
  if (dates.length === 0) {
    return 0;
  }

  const uniqueDates = [...new Set(dates)].sort().reverse();
  let streak = 0;
  let currentDate = new Date(`${uniqueDates[0]}T00:00:00`);

  for (const dateKey of uniqueDates) {
    if (dateKey !== formatDateKey(currentDate)) {
      break;
    }

    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

function buildWeeklyProgress(attempts, savedActivities) {
  const combinedEntries = [
    ...attempts.map((attempt) => ({ dateKey: toDateKey(attempt.attempted_at), value: Math.round(Number(attempt.score || 0)) })),
    ...savedActivities.map((activity) => ({ dateKey: toDateKey(activity.createdAt), value: 20 })),
  ].filter((entry) => entry.dateKey);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  return days.map((date) => {
    const key = formatDateKey(date);
    const dayEntries = combinedEntries.filter((entry) => entry.dateKey === key);
    const average = dayEntries.length ? Math.round(dayEntries.reduce((total, entry) => total + entry.value, 0) / dayEntries.length) : 0;

    return {
      name: date.toLocaleDateString(undefined, { weekday: 'short' }),
      value: clamp(dayEntries.length * 20 + average / 2, 8, 100),
      activities: dayEntries.length,
      averageScore: average,
    };
  });
}

function buildTopicProgress(topics, attempts) {
  const averageScore = attempts.length
    ? attempts.reduce((sum, attempt) => sum + Number(attempt.score || 0), 0) / attempts.length
    : 0;

  const sourceTopics = topics.length > 0 ? topics : CANONICAL_MATH_TOPICS.map((name, index) => ({ id: index + 1, name }));

  return sourceTopics.slice(0, 5).map((topic, index) => {
    const label = topic.name || CANONICAL_MATH_TOPICS[index] || `Topic ${index + 1}`;
    const masterScore = clamp(Math.round(34 + averageScore * 0.35 + index * 8 + (topic.description ? 4 : 0)), 14, 96);

    return {
      id: topic.id,
      label,
      description: topic.description || 'Topic practice and quiz work.',
      mastery: masterScore,
    };
  });
}

function deriveGamification({ topics, attempts, savedActivities, currentLessonCount }) {
  const attemptCount = attempts.length;
  const topicCount = topics.length;
  const totalScore = attempts.reduce((sum, attempt) => sum + Number(attempt.score || 0), 0);
  const averageScore = attemptCount ? Math.round(totalScore / attemptCount) : 0;
  const activityDates = combineActivityDates(attempts, savedActivities);
  const streakDays = countStreakDays(activityDates);
  const completedQuizzes = attemptCount;
  const completedTopics = topicCount > 0 ? Math.min(topicCount, Math.max(0, Math.round((attemptCount + savedActivities.length) / 2))) : 0;

  const xp =
    topicCount * 80 +
    currentLessonCount * 60 +
    attemptCount * 140 +
    Math.round(averageScore * 8) +
    streakDays * 45 +
    savedActivities.length * 35 +
    completedTopics * 25;

  const level = Math.max(1, Math.floor(xp / 1000) + 1);
  const xpInLevel = xp % 1000;
  const xpToNextLevel = 1000 - xpInLevel;

  const streakAchievement = streakDays >= 5;
  const quizAchievement = completedQuizzes >= 5;
  const scoreAchievement = averageScore >= 80;
  const topicAchievement = topicCount >= 3;
  const masteryAchievement = averageScore >= 90;

  const achievements = [
    {
      id: 'first-quiz',
      title: 'First quiz completed',
      detail: 'Shows up after your first submission.',
      unlocked: attemptCount > 0,
      tone: 'sky',
    },
    {
      id: 'streak',
      title: `${streakDays}-day streak`,
      detail: 'Keep working on consecutive days.',
      unlocked: streakAchievement,
      tone: 'amber',
    },
    {
      id: 'quiz-run',
      title: `${completedQuizzes} quizzes completed`,
      detail: 'Build quiz momentum through practice.',
      unlocked: quizAchievement,
      tone: 'emerald',
    },
    {
      id: 'mastery',
      title: '80% average score',
      detail: 'Maintain a strong quiz average.',
      unlocked: scoreAchievement,
      tone: 'violet',
    },
    {
      id: 'topic-explorer',
      title: `${topicCount} topics explored`,
      detail: 'Open more topics to unlock depth.',
      unlocked: topicAchievement,
      tone: 'indigo',
    },
    {
      id: 'top-score',
      title: '90% average score',
      detail: 'A high-skill milestone.',
      unlocked: masteryAchievement,
      tone: 'rose',
    },
  ];

  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;
  const dailyGoalTarget = 3;
  const todayKey = formatDateKey();
  const todayAttempts = attempts.filter((attempt) => toDateKey(attempt.attempted_at) === todayKey).length;
  const todayStudyLogs = savedActivities.filter((activity) => toDateKey(activity.createdAt) === todayKey).length;
  const dailyGoalCompleted = todayAttempts + todayStudyLogs;
  const dailyGoalProgress = clamp(Math.round((dailyGoalCompleted / dailyGoalTarget) * 100), 0, 100);

  return {
    attemptCount,
    topicCount,
    averageScore,
    xp,
    level,
    xpInLevel,
    xpToNextLevel,
    levelProgress: Math.round((xpInLevel / 1000) * 100),
    streakDays,
    achievements,
    unlockedAchievements,
    dailyGoalTarget,
    dailyGoalCompleted,
    dailyGoalProgress,
    completedQuizzes,
    completedTopics,
    scoreAchievement,
    streakAchievement,
  };
}

function buildRecentActivity(attempts, savedActivities, achievements) {
  const activityFeed = [
    ...attempts.map((attempt) => ({
      id: `attempt-${attempt.id}`,
      title: `Quiz: ${attempt.quiz_title || 'Math practice'}`,
      detail: `Score ${Math.round(Number(attempt.score || 0))}%`,
      time: attempt.attempted_at,
      tone: Number(attempt.score || 0) >= 80 ? 'emerald' : Number(attempt.score || 0) >= 60 ? 'sky' : 'amber',
    })),
    ...savedActivities.map((activity) => ({
      id: `activity-${activity.id}`,
      title: `${activity.type || 'Practice'} logged`,
      detail: activity.notes || 'Quick study note saved.',
      time: activity.createdAt,
      tone: 'slate',
    })),
  ];

  const unlocked = achievements.filter((achievement) => achievement.unlocked).slice(-2).map((achievement) => ({
    id: `achievement-${achievement.id}`,
    title: `Achievement: ${achievement.title}`,
    detail: achievement.detail,
    time: new Date().toISOString(),
    tone: achievement.tone,
  }));

  return [...activityFeed, ...unlocked]
    .sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())
    .slice(0, 6)
    .map((item, index) => ({
      ...item,
      timeLabel: index === 0 ? 'Latest' : index === 1 ? 'Recent' : `#${index + 1}`,
    }));
}

function buildNotifications(gamification, currentChallenge, currentTopic) {
  const messages = [];

  if (gamification.dailyGoalProgress >= 100) {
    messages.push({
      id: 'daily-goal',
      title: 'Daily goal complete',
      description: 'You have hit today\'s practice target.',
      tone: 'emerald',
    });
  } else {
    messages.push({
      id: 'daily-goal',
      title: `${gamification.dailyGoalTarget - gamification.dailyGoalCompleted} left today`,
      description: 'Finish a few more questions to close out the daily goal.',
      tone: 'sky',
    });
  }

  if (gamification.streakDays >= 5) {
    messages.push({
      id: 'streak',
      title: `${gamification.streakDays}-day streak`,
      description: 'Keep the streak running tomorrow.',
      tone: 'amber',
    });
  }

  if (currentChallenge?.question) {
    messages.push({
      id: 'challenge',
      title: 'Today\'s challenge is ready',
      description: currentChallenge.question,
      tone: 'violet',
    });
  } else if (currentTopic) {
    messages.push({
      id: 'topic',
      title: `Continue ${currentTopic.name}`,
      description: 'Open the next lesson and keep moving through the topic.',
      tone: 'indigo',
    });
  }

  return messages.slice(0, 3);
}

function buildCalendarEvents(currentTopic, savedActivities) {
  const events = [];

  if (currentTopic) {
    events.push({
      id: 'topic-review',
      title: `Review ${currentTopic.name}`,
      time: 'Today',
      label: 'Learning',
      tone: 'sky',
    });
  }

  savedActivities.slice(0, 2).forEach((activity, index) => {
    events.push({
      id: `activity-${index}`,
      title: activity.type || 'Practice session',
      time: activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Saved',
      label: 'Log',
      tone: 'emerald',
    });
  });

  events.push({
    id: 'tutor',
    title: 'Ask the AI tutor a question',
    time: 'Anytime',
    label: 'Support',
    tone: 'indigo',
  });

  return events.slice(0, 4);
}

export function downloadStudentReport({ profile, topics, attempts, gamification }) {
  if (typeof window === 'undefined') {
    return;
  }

  const rows = [
    ['Section', 'Value'],
    ['Student', profile?.first_name || profile?.username || 'Student'],
    ['Email', profile?.email || ''],
    ['Topics', String(topics.length)],
    ['Quiz attempts', String(attempts.length)],
    ['XP', String(gamification?.xp ?? 0)],
    ['Level', String(gamification?.level ?? 1)],
    ['Streak', `${gamification?.streakDays ?? 0} days`],
    ['Unlocked achievements', String(gamification?.unlockedAchievements ?? 0)],
    ['Average score', `${gamification?.averageScore ?? 0}%`],
  ];

  const report = [
    ...rows,
    ...attempts.map((attempt) => [
      `Quiz ${attempt.id}`,
      `${attempt.quiz_title || 'Math practice'} - ${Math.round(Number(attempt.score || 0))}% - ${attempt.attempted_at}`,
    ]),
  ]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([report], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mathmaster-progress-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useStudentDashboardData() {
  const [profile, setProfile] = useState(null);
  const [topics, setTopics] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [currentLearning, setCurrentLearning] = useState({
    currentTopic: null,
    currentLesson: null,
    currentQuiz: null,
    challengeQuestion: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = useCallback(() => {
    setRefreshIndex((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');

      const [profileResult, topicsResult, attemptsResult] = await Promise.allSettled([
        api.get('/api/accounts/profile/'),
        api.get('/api/learning/topics/'),
        api.get('/api/learning/performance/'),
      ]);

      if (!active) {
        return;
      }

      const baseFailures = [profileResult, topicsResult, attemptsResult]
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.response?.data?.detail || result.reason?.message || 'Unknown error');

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value.data || null);
      }

      if (topicsResult.status === 'fulfilled') {
        setTopics(Array.isArray(topicsResult.value.data) ? topicsResult.value.data : []);
      }

      if (attemptsResult.status === 'fulfilled') {
        setAttempts(Array.isArray(attemptsResult.value.data) ? attemptsResult.value.data : []);
      }

      const loadedTopics = topicsResult.status === 'fulfilled' && Array.isArray(topicsResult.value.data) ? topicsResult.value.data : [];
      let currentTopic = loadedTopics[0] || null;
      let currentLesson = null;
      let currentQuiz = null;
      let challengeQuestion = '';

      if (currentTopic?.id) {
        try {
          const lessonsResponse = await api.get(`/api/learning/topics/${currentTopic.id}/lessons/`);
          const lessons = Array.isArray(lessonsResponse.data) ? lessonsResponse.data : [];
          currentLesson = lessons[0] || null;

          if (currentLesson?.id) {
            const quizzesResponse = await api.get(`/api/learning/lessons/${currentLesson.id}/quizzes/`);
            const quizzes = Array.isArray(quizzesResponse.data) ? quizzesResponse.data : [];
            currentQuiz = quizzes[0] || null;

            if (currentQuiz?.id) {
              const questionsResponse = await api.get(`/api/learning/quizzes/${currentQuiz.id}/questions/`);
              const questions = Array.isArray(questionsResponse.data) ? questionsResponse.data : [];
              challengeQuestion = questions[0]?.question_text || '';
            }
          }
        } catch {
          // Keep the dashboard usable even if the detailed learning path is unavailable.
        }
      }

      if (!active) {
        return;
      }

      setCurrentLearning({
        currentTopic,
        currentLesson,
        currentQuiz,
        challengeQuestion,
      });

      if (baseFailures.length > 0) {
        setError(baseFailures[0]);
      }

      setLoading(false);
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [refreshIndex]);

  const savedActivities = readStoredValue(STORAGE_KEYS.activities, []);
  const settings = readStoredValue(STORAGE_KEYS.settings, {
    emailReminders: true,
    compactView: false,
  });

  const topicProgress = useMemo(() => buildTopicProgress(topics, attempts), [topics, attempts]);
  const weeklyProgress = useMemo(() => buildWeeklyProgress(attempts, savedActivities), [attempts, savedActivities]);
  const gamification = useMemo(
    () => deriveGamification({ topics, attempts, savedActivities, currentLessonCount: currentLearning.currentLesson ? 1 : 0 }),
    [attempts, currentLearning.currentLesson, savedActivities, topics],
  );
  const recentActivity = useMemo(() => buildRecentActivity(attempts, savedActivities, gamification.achievements), [attempts, gamification.achievements, savedActivities]);
  const notifications = useMemo(
    () => buildNotifications(gamification, currentLearning.currentQuiz ? { question: currentLearning.challengeQuestion } : null, currentLearning.currentTopic),
    [currentLearning.challengeQuestion, currentLearning.currentQuiz, currentLearning.currentTopic, gamification],
  );
  const calendarEvents = useMemo(() => buildCalendarEvents(currentLearning.currentTopic, savedActivities), [currentLearning.currentTopic, savedActivities]);

  const currentTopicPath = currentLearning.currentTopic ? `/topics/${currentLearning.currentTopic.id}/lessons` : '/topics';
  const currentQuizPath = currentLearning.currentQuiz ? `/quizzes/${currentLearning.currentQuiz.id}` : currentTopicPath;
  const currentChallengePath = currentQuizPath;
  const currentLessonPath = currentLearning.currentLesson ? `/lessons/${currentLearning.currentLesson.id}` : currentTopicPath;

  return {
    profile,
    topics,
    attempts,
    loading,
    error,
    refresh,
    currentLearning,
    currentTopic: currentLearning.currentTopic,
    currentLesson: currentLearning.currentLesson,
    currentQuiz: currentLearning.currentQuiz,
    challengeQuestion: currentLearning.challengeQuestion,
    currentTopicPath,
    currentLessonPath,
    currentQuizPath,
    currentChallengePath,
    topicProgress,
    weeklyProgress,
    recentActivity,
    notifications,
    calendarEvents,
    savedActivities,
    settings,
    storageKeys: STORAGE_KEYS,
    gamification: {
      ...gamification,
      averageScore: gamification.averageScore,
      achievements: gamification.achievements,
      unlockedAchievements: gamification.unlockedAchievements,
    },
    stats: {
      topicCount: topics.length,
      attemptCount: attempts.length,
      averageScore: gamification.averageScore,
      bestScore: attempts.length ? Math.round(Math.max(...attempts.map((attempt) => Number(attempt.score || 0)))) : 0,
      latestAttempt: attempts.slice().sort((left, right) => new Date(right.attempted_at).getTime() - new Date(left.attempted_at).getTime())[0] || null,
      completedTopics: gamification.completedTopics,
      completedQuizzes: gamification.completedQuizzes,
      xp: gamification.xp,
      level: gamification.level,
      xpInLevel: gamification.xpInLevel,
      xpToNextLevel: gamification.xpToNextLevel,
      levelProgress: gamification.levelProgress,
      progress: gamification.levelProgress,
      placementProgress: clamp(Math.round(gamification.levelProgress * 0.65 + topics.length * 4 + savedActivities.length * 3), 12, 100),
      streakDays: gamification.streakDays,
      unlockedAchievements: gamification.unlockedAchievements,
      dailyGoalTarget: gamification.dailyGoalTarget,
      dailyGoalCompleted: gamification.dailyGoalCompleted,
      dailyGoalProgress: gamification.dailyGoalProgress,
    },
    recentActivities: recentActivity,
    persistActivities: (value) => writeStoredValue(STORAGE_KEYS.activities, value),
    persistReminders: (value) => writeStoredValue(STORAGE_KEYS.reminders, value),
    persistEvaluationRequests: (value) => writeStoredValue(STORAGE_KEYS.evaluationRequests, value),
    persistEndorsements: (value) => writeStoredValue(STORAGE_KEYS.endorsements, value),
    persistSettings: (value) => writeStoredValue(STORAGE_KEYS.settings, value),
    downloadReport: () => downloadStudentReport({ profile, topics, attempts, gamification }),
  };
}
