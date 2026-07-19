import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  AnalyticsSection,
  CurriculumTable,
  QuickActions,
  ResourceCards,
  RightSidebar,
  Sidebar,
  StatsCards,
  TopNavbar,
} from '../components/teacher-dashboard/TeacherDashboardComponents';
import { Badge, Card, CardBody, CardHeader } from '../components/ui';
import {
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  LibraryBig,
  LineChart,
  MessageSquare,
  PenTool,
  Settings2,
  Sparkles,
  Users,
  ChevronRight,
} from 'lucide-react';

function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [themeMode, setThemeMode] = useState('light');
  const role = localStorage.getItem('role');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  useEffect(() => {
    if (role && role !== 'teacher') {
      navigate('/dashboard');
      return;
    }

    const fetchTeacherData = async () => {
      try {
        const profileResponse = await api.get('/api/accounts/profile/');
        const topicsResponse = await api.get('/api/learning/topics/');
        const topics = topicsResponse.data || [];

        const enrichedTopics = await Promise.all(
          topics.map(async (topic) => {
            const lessonResponse = await api.get(`/api/learning/topics/${topic.id}/lessons/`);
            const lessons = lessonResponse.data || [];

            const lessonWithQuizzes = await Promise.all(
              lessons.map(async (lesson) => {
                const quizResponse = await api.get(`/api/learning/lessons/${lesson.id}/quizzes/`);
                return {
                  ...lesson,
                  quizCount: (quizResponse.data || []).length,
                };
              }),
            );

            return {
              ...topic,
              lessons: lessonWithQuizzes,
            };
          }),
        );

        setTeacher(profileResponse.data);
        setContent(enrichedTopics);
      } catch (err) {
        setError('Failed to load teacher dashboard data');
        console.error('Error fetching teacher dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [role, navigate]);

  const stats = useMemo(() => {
    const topicCount = content.length;
    const lessonCount = content.reduce((total, topic) => total + (topic.lessons?.length || 0), 0);
    const quizCount = content.reduce(
      (total, topic) => total + (topic.lessons || []).reduce((lessonTotal, lesson) => lessonTotal + (lesson.quizCount || 0), 0),
      0,
    );
    const coveredTopics = content.filter(
      (topic) => (topic.lessons?.length || 0) > 0 && (topic.lessons || []).some((lesson) => (lesson.quizCount || 0) > 0),
    ).length;

    return {
      topicCount,
      lessonCount,
      quizCount,
      coverage: topicCount ? Math.round((coveredTopics / topicCount) * 100) : 0,
    };
  }, [content]);

  const curriculumRows = useMemo(
    () =>
      content.map((topic, index) => {
        const lessons = topic.lessons?.length || 0;
        const quizzes = (topic.lessons || []).reduce((total, lesson) => total + (lesson.quizCount || 0), 0);
        const completion = topicCompletionFrom(topic.lessons?.length || 0, quizzes, index);

        return {
          id: topic.id,
          topic: topic.name,
          description: topic.description || 'Structured topic with lesson and assessment flow.',
          lessons,
          quizzes,
          status: completion >= 80 ? 'Ready' : lessons > 0 ? 'In progress' : 'Draft',
          statusTone: completion >= 80 ? 'emerald' : lessons > 0 ? 'amber' : 'rose',
          students: 18 + lessons * 6 + quizzes * 2,
          completion,
        };
      }),
    [content],
  );

  const chartData = useMemo(() => {
    const lessonCount = Math.max(stats.lessonCount, 1);
    const mastered = Math.max(54, Math.min(88, stats.coverage || 0));
    const inProgress = Math.max(8, Math.min(34, 100 - mastered - 14));
    const needsReview = Math.max(6, 100 - mastered - inProgress);

    return {
      studentProgress: [
        { name: 'Mon', value: Math.max(40, (stats.coverage || 46) + 8) },
        { name: 'Tue', value: Math.max(48, (stats.coverage || 46) + 14) },
        { name: 'Wed', value: Math.max(52, (stats.coverage || 46) + 20) },
        { name: 'Thu', value: Math.max(55, (stats.coverage || 46) + 18) },
        { name: 'Fri', value: Math.max(58, (stats.coverage || 46) + 22) },
        { name: 'Sat', value: Math.max(60, (stats.coverage || 46) + 19) },
        { name: 'Sun', value: Math.max(63, (stats.coverage || 46) + 24) },
      ],
      weeklyActivity: [
        { name: 'Mon', lessons: Math.max(lessonCount - 2, 4) },
        { name: 'Tue', lessons: Math.max(lessonCount - 1, 6) },
        { name: 'Wed', lessons: Math.max(lessonCount + 1, 8) },
        { name: 'Thu', lessons: Math.max(lessonCount + 2, 7) },
        { name: 'Fri', lessons: Math.max(lessonCount, 5) },
        { name: 'Sat', lessons: Math.max(lessonCount - 3, 3) },
        { name: 'Sun', lessons: Math.max(lessonCount - 1, 4) },
      ],
      quizPerformance: [
        { subject: 'Algebra', score: 88 },
        { subject: 'Geometry', score: 84 },
        { subject: 'Functions', score: 79 },
        { subject: 'Statistics', score: 91 },
        { subject: 'Trigonometry', score: 81 },
      ],
      topicCompletion: {
        overall: stats.coverage || 87,
        breakdown: [
          { name: 'Mastered', value: mastered, color: '#2563EB' },
          { name: 'In progress', value: inProgress, color: '#0EA5E9' },
          { name: 'Needs review', value: needsReview, color: '#F59E0B' },
        ],
      },
      timeline: [
        { title: 'Uploaded a new calculus lesson', description: 'Added worked examples and linked practice items to the lesson path.', time: '10 min ago', icon: FileText, iconSurface: 'bg-sky-50 text-sky-700' },
        { title: 'Reviewed learner quiz analytics', description: 'Detected a small dip in geometry performance across two topics.', time: '32 min ago', icon: LineChart, iconSurface: 'bg-indigo-50 text-indigo-700' },
        { title: 'Answered a student question', description: 'Provided a short derivation for the quadratic formula.', time: '1 hr ago', icon: MessageSquare, iconSurface: 'bg-emerald-50 text-emerald-700' },
      ],
    };
  }, [stats.coverage, stats.lessonCount]);

  const sidebarSections = [
    { id: 'overview', label: 'Dashboard', description: 'Teaching command center', icon: LayoutDashboard, badge: 'Live', badgeTone: 'bg-sky-400/15 text-sky-100' },
    { id: 'topics', label: 'Topics', description: 'Curriculum map', icon: Layers3, badge: `${stats.topicCount || 0}`, badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'lessons', label: 'Lessons', description: 'Published content', icon: BookOpen, badge: `${stats.lessonCount || 0}`, badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'quizzes', label: 'Quizzes', description: 'Assessments and checks', icon: ClipboardList, badge: `${stats.quizCount || 0}`, badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'students', label: 'Students', description: 'Learner performance', icon: Users, badge: '126', badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'assignments', label: 'Assignments', description: 'Quick actions', icon: PenTool, badge: '5', badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'analytics', label: 'Analytics', description: 'Teaching signals', icon: LineChart, badge: 'New', badgeTone: 'bg-sky-400/15 text-sky-100' },
    { id: 'formula-library', label: 'Formula Library', description: 'Math reference', icon: LibraryBig, badge: 'Σ', badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'whiteboard', label: 'Whiteboard', description: 'Visual thinking space', icon: GraduationCap, badge: 'Draw', badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'ai-tutor', label: 'AI Tutor', description: 'Guided support', icon: BrainCircuit, badge: 'AI', badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'reports', label: 'Reports', description: 'Insights and exports', icon: FileText, badge: '2', badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'calendar', label: 'Calendar', description: 'Teaching schedule', icon: CalendarDays, badge: '3', badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'messages', label: 'Messages', description: 'Inbox and feedback', icon: MessageSquare, badge: '4', badgeTone: 'bg-white/10 text-sky-100' },
    { id: 'settings', label: 'Settings', description: 'Workspace control', icon: Settings2, badge: '', badgeTone: '' },
  ];

  const quickActions = [
    {
      title: 'Create Topic',
      description: 'Add a new concept block to the curriculum.',
      to: '/topics',
      icon: Sparkles,
      iconSurface: 'bg-sky-50',
      iconTone: 'text-sky-700',
      surface: 'bg-gradient-to-br from-sky-50 to-white',
    },
    {
      title: 'New Lesson',
      description: 'Draft a lesson and attach practice.',
      to: '/topics',
      icon: BookOpen,
      iconSurface: 'bg-indigo-50',
      iconTone: 'text-indigo-700',
      surface: 'bg-gradient-to-br from-indigo-50 to-white',
    },
    {
      title: 'Create Quiz',
      description: 'Assess understanding in a few clicks.',
      to: '/quizzes/1',
      icon: ClipboardList,
      iconSurface: 'bg-amber-50',
      iconTone: 'text-amber-700',
      surface: 'bg-gradient-to-br from-amber-50 to-white',
    },
    {
      title: 'View Reports',
      description: 'Check teaching signals and learner progress.',
      to: '/performance',
      icon: LineChart,
      iconSurface: 'bg-emerald-50',
      iconTone: 'text-emerald-700',
      surface: 'bg-gradient-to-br from-emerald-50 to-white',
    },
    {
      title: 'Open AI Tutor',
      description: 'Get lesson help or generate prompts.',
      to: '/ai-tutor',
      icon: BrainCircuit,
      iconSurface: 'bg-violet-50',
      iconTone: 'text-violet-700',
      surface: 'bg-gradient-to-br from-violet-50 to-white',
    },
  ];

  const calendarEvents = [
    { title: 'Grade 10 Algebra', time: '09:30', label: 'Lesson', tone: 'sky' },
    { title: 'Quiz review meeting', time: '13:00', label: 'Meeting', tone: 'amber' },
    { title: 'AI tutor check-in', time: '16:15', label: 'AI', tone: 'indigo' },
  ];

  const schedule = [
    { title: 'Morning planning', subtitle: 'Finalize lesson pacing and curriculum checks.', time: '08:00', tone: 'sky' },
    { title: 'Live class', subtitle: 'Deliver the main math lesson for today.', time: '09:30', tone: 'emerald' },
    { title: 'Student support', subtitle: 'Answer follow-up questions and provide feedback.', time: '14:45', tone: 'amber' },
  ];

  const upcomingLessons = [
    { title: 'Quadratic functions', topic: 'Algebra II', time: 'Today', tone: 'sky' },
    { title: 'Circles and angles', topic: 'Geometry', time: 'Tomorrow', tone: 'indigo' },
    { title: 'Data and probability', topic: 'Statistics', time: 'Fri', tone: 'emerald' },
  ];

  const recentMessages = [
    { title: 'Amina M.', initials: 'AM', time: '5m', preview: 'Can you explain the step before completing the square?' },
    { title: 'Kevin T.', initials: 'KT', time: '22m', preview: 'I finished the quiz and want to review question 4.' },
    { title: 'Class 10B', initials: '10', time: '1h', preview: 'Please upload the worksheet for tomorrow&apos;s lesson.' },
  ];

  const aiSuggestions = [
    { title: 'Add an exit ticket', description: 'A 3-question micro-check would raise confidence before the next lesson.' },
    { title: 'Revisit geometry misconceptions', description: 'Several learners missed angle relationships in the latest assessment.' },
    { title: 'Generate differentiated practice', description: 'Create a harder and easier version of the same quiz to support mixed pace.' },
  ];

  const studentQuestions = [
    { title: 'Why does the sign change when moving terms?', description: 'A common algebra question that is ideal for a worked example card.' },
    { title: 'How do I know when to use sine or cosine?', description: 'Add a visual triangle prompt with labeled edges.' },
  ];

  const reminders = [
    { title: 'Publish the next lesson before 3 PM', description: 'Keep the sequence visible for students by updating the lesson queue.' },
    { title: 'Review quiz trends for the week', description: 'Focus on low-scoring topics and add targeted practice.' },
  ];

  const formulaCards = [
    { subtitle: 'Quadratic', title: 'Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a' },
    { subtitle: 'Circle', title: 'Area', formula: 'A = πr²' },
    { subtitle: 'Triangle', title: 'Sum theorem', formula: '∠A + ∠B + ∠C = 180°' },
  ];

  const aiTutorCards = [
    { title: 'Explain a concept', description: 'Ask for a step-by-step explanation with examples.' },
    { title: 'Create revision prompts', description: 'Generate targeted practice from a topic or lesson.' },
    { title: 'Draft feedback', description: 'Write constructive feedback for a student submission.' },
  ];

  const onToggleTheme = () => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'));

  const themeShellClass =
    themeMode === 'dark'
      ? 'bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.22),_transparent_28%),radial-gradient(circle_at_85%_10%,_rgba(124,58,237,0.18),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-slate-50'
      : 'bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_30%),radial-gradient(circle_at_85%_10%,_rgba(124,58,237,0.10),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950';

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);

    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className={themeShellClass}>
        <div className="flex min-h-screen items-center justify-center px-4">
          <Card className="px-6 py-5 text-slate-600">Loading teacher dashboard...</Card>
        </div>
      </div>
    );
  }

  return (
    <div className={themeShellClass}>
      <Sidebar
        sections={sidebarSections}
        activeSection={activeSection}
        onSelect={handleSectionSelect}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        teacher={teacher}
        themeMode={themeMode}
        onToggleTheme={onToggleTheme}
      />

      <main className={sidebarCollapsed ? 'md:pl-20 lg:pl-20' : 'md:pl-20 lg:pl-72'}>
        <div className="mx-auto max-w-[1800px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <TopNavbar
            teacher={teacher}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleMobileSidebar={() => setSidebarOpen(true)}
            onToggleTheme={onToggleTheme}
            themeMode={themeMode}
            notifications={4}
          />

          {error ? (
            <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section id="overview" className="space-y-6">
                <StatsCards
                  stats={[
                    {
                      id: 'topics',
                      label: 'Topics',
                      value: stats.topicCount || 28,
                      suffix: '',
                      description: 'Active topics in the current curriculum map.',
                      detail: 'Curriculum coverage across the term',
                      icon: Layers3,
                      surface: 'bg-white',
                      iconSurface: 'bg-sky-50',
                      iconTone: 'text-sky-700',
                    },
                    {
                      id: 'lessons',
                      label: 'Lessons',
                      value: stats.lessonCount || 143,
                      suffix: '',
                      description: 'Published lessons ready for student access.',
                      detail: 'Learning content shipped',
                      icon: BookOpen,
                      surface: 'bg-white',
                      iconSurface: 'bg-indigo-50',
                      iconTone: 'text-indigo-700',
                    },
                    {
                      id: 'students',
                      label: 'Students',
                      value: 126,
                      suffix: '',
                      description: 'Enrolled learners following your instruction.',
                      detail: 'Active classroom membership',
                      icon: Users,
                      surface: 'bg-white',
                      iconSurface: 'bg-emerald-50',
                      iconTone: 'text-emerald-700',
                    },
                    {
                      id: 'quizzes',
                      label: 'Quiz Completion',
                      value: stats.coverage || 87,
                      suffix: '%',
                      description: 'Assessment completion rate for the curriculum.',
                      detail: 'Assessment momentum this week',
                      icon: LineChart,
                      surface: 'bg-white',
                      iconSurface: 'bg-amber-50',
                      iconTone: 'text-amber-700',
                    },
                  ]}
                />

                <QuickActions actions={quickActions} />
              </section>

              <div id="quizzes" aria-hidden="true" className="h-0 scroll-mt-28" />
              <section id="analytics">
                <AnalyticsSection
                  studentProgress={chartData.studentProgress}
                  weeklyActivity={chartData.weeklyActivity}
                  quizPerformance={chartData.quizPerformance}
                  topicCompletion={chartData.topicCompletion}
                  timeline={chartData.timeline}
                />
              </section>

              <section id="reports" className="space-y-6">
                <CurriculumTable rows={curriculumRows} />
                <ResourceCards formulaCards={formulaCards} aiTutorCards={aiTutorCards} />
              </section>

              <section id="settings" className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <Card>
                  <CardHeader className="border-transparent pb-3">
                    <Badge tone="sky">Teacher profile</Badge>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-950">Workspace snapshot</h3>
                  </CardHeader>
                  <CardBody className="space-y-4 text-sm leading-7 text-slate-600">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Username</p>
                        <p className="mt-2 font-semibold text-slate-950">{teacher?.username || 'Teacher'}</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Email</p>
                        <p className="mt-2 font-semibold text-slate-950">{teacher?.email || 'Not available'}</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Role</p>
                        <p className="mt-2 font-semibold capitalize text-slate-950">{teacher?.role || 'teacher'}</p>
                      </div>
                    </div>
                    <p>
                      This redesign turns the teacher workspace into a premium control center with fixed navigation, analytics, and teaching operations.
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader className="border-transparent pb-3">
                    <Badge tone="amber">Settings</Badge>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-950">Workspace controls</h3>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    {[
                      'Notification preferences',
                      'Curriculum visibility',
                      'Assessment publishing',
                      'Teacher profile preferences',
                    ].map((item) => (
                      <div key={item} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="text-sm font-medium text-slate-700">{item}</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </section>
            </div>

            <aside className="xl:sticky xl:top-28 xl:self-start">
              <div id="students" aria-hidden="true" className="h-0 scroll-mt-28" />
              <RightSidebar
                schedule={schedule}
                upcomingLessons={upcomingLessons}
                recentMessages={recentMessages}
                aiSuggestions={aiSuggestions}
                studentQuestions={studentQuestions}
                reminders={reminders}
                calendarEvents={calendarEvents}
              />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function topicCompletionFrom(lessonCount, quizzes, index) {
  const completion = Math.min(96, Math.round((lessonCount * 18 + quizzes * 10 + (index + 1) * 4) / 2));
  return Math.max(24, completion);
}

export default TeacherDashboard;