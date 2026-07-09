import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, FeatureTile, ProgressBar } from '../components/ui';
import { BookOpen, ChevronRight, ClipboardList, LayoutDashboard, LineChart, LibraryBig, Sparkles } from 'lucide-react';

function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const role = localStorage.getItem('role');

  const quickActions = [
    { title: 'Assign Exercise', description: 'Send practice work to a topic.', to: '/topics', icon: 'add_task' },
    { title: 'Generate Report', description: 'Review student performance data.', to: '/performance', icon: 'assessment' },
    { title: 'Message Class', description: 'Open the tutor space for guidance.', to: '/ai-tutor', icon: 'chat' },
  ];

  const teacherSections = [
    { id: 'overview', label: 'Overview', description: 'Live status and coverage', icon: LayoutDashboard },
    { id: 'classes', label: 'Classes', description: 'Topics and lesson depth', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', description: 'Quick action hub', icon: ClipboardList },
    { id: 'reports', label: 'Reports', description: 'Graphs and performance', icon: LineChart },
    { id: 'resources', label: 'Resources', description: 'Math formulas and diagrams', icon: LibraryBig },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
  };

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

  const featuredTopic = content[0];
  const spotlightLessons = featuredTopic?.lessons?.slice(0, 3) || [];
  const emptyTopics = content.filter((topic) => (topic.lessons?.length || 0) === 0);
  const emptyQuizzes = content.filter((topic) =>
    (topic.lessons || []).some((lesson) => (lesson.quizCount || 0) === 0),
  );

  const renderSectionPanel = () => {
    if (activeSection === 'classes') {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-transparent pb-3">
              <Badge tone="indigo">Curriculum map</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Topic coverage and lesson depth</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {content.length > 0 ? (
                content.map((topic, index) => {
                  const lessonCount = topic.lessons?.length || 0;
                  const quizCount = (topic.lessons || []).reduce((total, lesson) => total + (lesson.quizCount || 0), 0);
                  const attentionNeeded = lessonCount === 0 || quizCount === 0;

                  return (
                    <div key={topic.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-200 hover:bg-sky-50/60">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Topic {index + 1}</p>
                          <h3 className="mt-1 text-lg font-semibold text-slate-950">{topic.name}</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            {topic.description || 'No description provided yet.'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge tone="sky">{lessonCount} lessons</Badge>
                          <Badge tone="indigo">{quizCount} quizzes</Badge>
                          <Badge tone={attentionNeeded ? 'amber' : 'emerald'}>
                            {attentionNeeded ? 'Needs attention' : 'Ready'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-600">
                  Add topics in the learning section to see curriculum coverage here.
                </div>
              )}
            </CardBody>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader className="border-transparent pb-3">
                <Badge tone="emerald">Featured topic</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                  {featuredTopic ? featuredTopic.name : 'No topics yet'}
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {featuredTopic ? (
                  <>
                    <p className="text-sm leading-7 text-slate-600">{featuredTopic.description || 'A strong starting point for your course map.'}</p>
                    <div className="space-y-3">
                      {spotlightLessons.length > 0 ? (
                        spotlightLessons.map((lesson) => (
                          <div key={lesson.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-slate-950">{lesson.title}</p>
                              <Badge tone={lesson.quizCount > 0 ? 'emerald' : 'amber'}>
                                {lesson.quizCount > 0 ? `${lesson.quizCount} quizzes` : 'Add quiz'}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                          This topic does not have lessons yet.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">Your first topic will appear here once learning content is added.</p>
                )}
              </CardBody>
              <CardFooter className="flex flex-wrap gap-3 border-transparent pt-0">
                <Link to="/topics">
                  <Button size="sm">Manage topics</Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="secondary" size="sm">Student view</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="border-transparent pb-3">
                <Badge tone="amber">Needs attention</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Content gaps</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {emptyTopics.length === 0 && emptyQuizzes.length === 0 ? (
                  <p className="text-sm leading-6 text-slate-600">
                    All current topics have lessons and quizzes. Add more content to expand the curriculum.
                  </p>
                ) : (
                  <div className="space-y-3 text-sm text-slate-700">
                    {emptyTopics.slice(0, 2).map((topic) => (
                      <div key={`topic-${topic.id}`} className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800">
                        {topic.name} still needs lessons.
                      </div>
                    ))}
                    {emptyQuizzes.slice(0, 2).map((topic) => (
                      <div key={`quiz-${topic.id}`} className="rounded-2xl bg-sky-50 px-4 py-3 text-sky-800">
                        {topic.name} has lessons without quizzes.
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      );
    }

    if (activeSection === 'assignments') {
      return (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader className="border-transparent pb-3">
              <Badge tone="rose">Quick actions</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Shortcuts for teaching work</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link key={action.title} to={action.to} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{action.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                      </div>
                      <span className="material-symbols-outlined text-sky-600">{action.icon}</span>
                    </div>
                  </Link>
                ))}
                <Link to="/dashboard" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50">
                  <p className="font-semibold text-slate-950">Student dashboard</p>
                  <p className="mt-1 text-sm text-slate-600">See the learner experience.</p>
                </Link>
                <Link to="/topics" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50">
                  <p className="font-semibold text-slate-950">Content planning</p>
                  <p className="mt-1 text-sm text-slate-600">Map lessons to each topic.</p>
                </Link>
              </div>
              <Button variant="secondary" className="w-full justify-center" onClick={handleLogout}>
                Sign out
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="border-transparent pb-3">
              <Badge tone="sky">Student handoff</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Move between teacher and learner views</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-7 text-slate-600">
              <p>
                The student dashboard shortcut now routes directly to the learner workspace, so you can check both views in one flow.
              </p>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">One-click switch</p>
                <p className="mt-3 font-mono text-lg text-slate-950">/teacher-dashboard → /dashboard</p>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    if (activeSection === 'reports') {
      return (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader className="border-transparent pb-3">
              <Badge tone="indigo">Reports</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Progress by the numbers</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FeatureTile title="Topics" value={`${stats.topicCount}`} caption="Curriculum areas available now." tone="sky" />
                <FeatureTile title="Quizzes" value={`${stats.quizCount}`} caption="Assessment checkpoints attached to lessons." tone="amber" />
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Coverage</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{stats.coverage}% of topics have full lesson paths.</p>
                  </div>
                  <Sparkles className="h-5 w-5 text-sky-500" />
                </div>
                <ProgressBar value={stats.coverage} className="mt-4" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="border-transparent pb-3">
              <Badge tone="emerald">Formula wall</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Key equations and geometry cues</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-7 text-slate-600">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Quadratic formula</p>
                <p className="mt-3 font-mono text-lg text-slate-950">x = (-b ± √(b² - 4ac)) / 2a</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pythagorean theorem</p>
                <p className="mt-3 font-mono text-lg text-slate-950">a² + b² = c²</p>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    if (activeSection === 'resources') {
      return (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader className="border-transparent pb-3">
              <Badge tone="sky">Diagram board</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Graph and triangle sketch</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-7 text-slate-600">
              <svg className="h-44 w-full" viewBox="0 0 320 180" role="img" aria-label="Function and triangle diagram">
                <defs>
                  <linearGradient id="teacherCurve" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="320" height="180" rx="20" fill="rgba(255,255,255,0.03)" />
                <line x1="24" y1="150" x2="296" y2="150" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <line x1="160" y1="20" x2="160" y2="160" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <path d="M 40 142 Q 160 35 280 142" fill="none" stroke="url(#teacherCurve)" strokeWidth="4" strokeLinecap="round" />
                <path d="M 210 140 L 270 140 L 270 80 Z" fill="rgba(96,165,250,0.16)" stroke="#60a5fa" strokeWidth="3" />
                <text x="34" y="168" fill="#cbd5e1" fontSize="12">y = x²</text>
                <text x="220" y="72" fill="#cbd5e1" fontSize="12">right triangle</text>
              </svg>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Workbook flow</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">Review and practice</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Navigation</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">Stay on the same page</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="border-transparent pb-3">
              <Badge tone="indigo">Formula wall</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Key equations and shortcuts</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-7 text-slate-600">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Area of a circle</p>
                <p className="mt-3 font-mono text-lg text-slate-950">A = πr²</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Slope form</p>
                <p className="mt-3 font-mono text-lg text-slate-950">y - y₁ = m(x - x₁)</p>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="border-transparent pb-3">
            <Badge tone="sky">Teacher overview</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Live classroom snapshot</h2>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FeatureTile title="Topics" value={`${stats.topicCount}`} caption="Curriculum areas available for students." tone="sky" />
              <FeatureTile title="Lessons" value={`${stats.lessonCount}`} caption="Step-by-step lesson pages ready for students." tone="amber" />
              <FeatureTile title="Quizzes" value={`${stats.quizCount}`} caption="Assessment checkpoints attached to lessons." tone="ink" />
              <FeatureTile title="Coverage" value={`${stats.coverage}%`} caption="Topics that have both lessons and quizzes." tone="sky" />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Teacher profile</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Username</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{teacher?.username || 'Teacher'}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Email</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{teacher?.email || 'Not available'}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Role</p>
                  <p className="mt-2 text-sm font-semibold capitalize text-slate-950">{teacher?.role || 'teacher'}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/topics" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800">
                Open curriculum
              </Link>
              <Link to="/performance" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50">
                Review reports
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden bg-slate-950 text-white">
          <CardHeader className="border-slate-800">
            <Badge tone="sky">Student handoff</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-white">Move into the learner view</h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-7 text-slate-300">
            <p>
              The student dashboard shortcut is functional and routes straight to the learner workspace, so you can compare both experiences.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Switch</p>
                <p className="mt-2 text-base font-semibold text-white">Teacher to student</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Route</p>
                <p className="mt-2 text-base font-semibold text-white">/dashboard</p>
              </div>
            </div>
          </CardBody>
          <CardFooter className="border-slate-800">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-slate-100">
              Open student dashboard
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.24),_transparent_34%),radial-gradient(circle_at_85%_15%,_rgba(168,85,247,0.15),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
        <Navbar isLoggedIn />
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-16">
          <Card className="px-6 py-5 text-slate-600">
            Loading teacher dashboard...
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-noise text-slate-950">
      <Navbar isLoggedIn />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="section-divider mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-3xl">
              <Badge tone="sky">Teacher workspace</Badge>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Build and track your MathMaster curriculum.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Monitor topics, lesson flow, and quiz readiness from one place. These numbers are pulled from the live learning content in your project.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/topics" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800">
                  Open curriculum
                </Link>
                <Link to="/performance" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50">
                  Review reports
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <FeatureTile title="Coverage" value={`${stats.coverage}%`} caption="Topics that already include lessons and quizzes." tone="sky" />
              <FeatureTile title="Teaching flow" value={`${stats.lessonCount} lessons`} caption="Structured lesson pages ready for students." tone="amber" />
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader className="border-transparent pb-3">
              <Badge tone="indigo">Formula wall</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Key equations and geometry cues</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-7 text-slate-600">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Quadratic formula</p>
                <p className="mt-3 font-mono text-lg text-slate-950">x = (-b ± √(b² - 4ac)) / 2a</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pythagorean theorem</p>
                  <p className="mt-3 font-mono text-lg text-slate-950">a² + b² = c²</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Triangle sum</p>
                  <p className="mt-3 font-mono text-lg text-slate-950">∠A + ∠B + ∠C = 180°</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="overflow-hidden bg-slate-950 text-white">
            <CardHeader className="border-slate-800">
              <Badge tone="sky">Diagram board</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-white">Graph and triangle sketch</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-7 text-slate-300">
              <svg className="h-44 w-full" viewBox="0 0 320 180" role="img" aria-label="Function and triangle diagram">
                <defs>
                  <linearGradient id="teacherCurve" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="320" height="180" rx="20" fill="rgba(255,255,255,0.03)" />
                <line x1="24" y1="150" x2="296" y2="150" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <line x1="160" y1="20" x2="160" y2="160" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <path d="M 40 142 Q 160 35 280 142" fill="none" stroke="url(#teacherCurve)" strokeWidth="4" strokeLinecap="round" />
                <path d="M 210 140 L 270 140 L 270 80 Z" fill="rgba(96,165,250,0.16)" stroke="#60a5fa" strokeWidth="3" />
                <text x="34" y="168" fill="#cbd5e1" fontSize="12">y = x²</text>
                <text x="220" y="72" fill="#cbd5e1" fontSize="12">right triangle</text>
              </svg>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Workflow</p>
                  <p className="mt-2 text-base font-semibold text-white">Review and practice</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Navigation</p>
                  <p className="mt-2 text-base font-semibold text-white">Stay on the same page</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="self-start rounded-[2rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:sticky lg:top-6">
            <div className="px-2 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Teacher menu</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Dashboard sections</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Move through the dashboard without leaving the page.
              </p>
            </div>

            <div className="mt-3 space-y-2">
              {teacherSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                      isActive
                        ? 'border-sky-200 bg-sky-50 text-slate-950 shadow-[0_16px_40px_rgba(14,165,233,0.12)]'
                        : 'border-transparent bg-slate-50/80 text-slate-600 hover:border-sky-100 hover:bg-sky-50/60 hover:text-slate-950'
                    }`}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isActive ? 'bg-white text-sky-600' : 'bg-white text-slate-500'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{section.label}</span>
                      <span className="block text-xs text-slate-500">{section.description}</span>
                    </span>
                    {isActive ? <ChevronRight className="h-4 w-4 text-sky-500" /> : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-[1.5rem] bg-slate-950 p-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Teacher cue</p>
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>
              <p className="mt-3 text-lg font-semibold">Keep the learning arc visible.</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use the sections to review classes, assignments, reports, and resources in one place.
              </p>
            </div>
          </aside>

          <div className="space-y-6">{renderSectionPanel()}</div>
        </section>
      </main>
    </div>
  );
}

export default TeacherDashboard;