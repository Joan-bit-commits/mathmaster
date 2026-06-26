import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, FeatureTile, ProgressBar } from '../components/ui';

function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const role = localStorage.getItem('role');

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
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <FeatureTile title="Coverage" value={`${stats.coverage}%`} caption="Topics that already include lessons and quizzes." tone="sky" />
              <FeatureTile title="Teaching flow" value={`${stats.lessonCount} lessons`} caption="Structured lesson pages ready for students." tone="amber" />
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardBody>
              <p className="text-sm font-medium text-slate-500">Topics</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{stats.topicCount}</p>
              <p className="mt-2 text-sm text-slate-600">Curriculum areas available for students.</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm font-medium text-slate-500">Lessons</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{stats.lessonCount}</p>
              <p className="mt-2 text-sm text-slate-600">Step-by-step lesson pages currently published.</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm font-medium text-slate-500">Quizzes</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{stats.quizCount}</p>
              <p className="mt-2 text-sm text-slate-600">Assessment checkpoints attached to lessons.</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm font-medium text-slate-500">Coverage</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{stats.coverage}%</p>
              <p className="mt-2 text-sm text-slate-600">Topics that have both lessons and quizzes.</p>
              <ProgressBar value={stats.coverage} className="mt-4" />
            </CardBody>
          </Card>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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

          <div className="space-y-6">
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
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="border-transparent pb-3">
              <Badge tone="sky">Teacher profile</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Account details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {teacher ? (
                <>
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-500">Username</span>
                    <span className="font-semibold text-slate-950">{teacher.username}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-500">Email</span>
                    <span className="font-semibold text-slate-950">{teacher.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-500">Role</span>
                    <span className="font-semibold capitalize text-slate-950">{teacher.role}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-600">Unable to load profile.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="border-transparent pb-3">
              <Badge tone="rose">Quick actions</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Shortcuts for teaching work</h2>
            </CardHeader>
            <CardBody className="grid gap-3 sm:grid-cols-2">
              <Link to="/topics" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50">
                <p className="font-semibold text-slate-950">Open topics</p>
                <p className="mt-1 text-sm text-slate-600">Review the curriculum structure.</p>
              </Link>
              <Link to="/performance" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50">
                <p className="font-semibold text-slate-950">View performance</p>
                <p className="mt-1 text-sm text-slate-600">Check student attempt history.</p>
              </Link>
              <Link to="/ai-tutor" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50">
                <p className="font-semibold text-slate-950">AI tutor</p>
                <p className="mt-1 text-sm text-slate-600">Test the tutoring assistant directly.</p>
              </Link>
              <Link to="/dashboard" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50">
                <p className="font-semibold text-slate-950">Student dashboard</p>
                <p className="mt-1 text-sm text-slate-600">See the learner experience.</p>
              </Link>
              <button className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-200 hover:bg-sky-50">
                <p className="font-semibold text-slate-950">Content planning</p>
                <p className="mt-1 text-sm text-slate-600">Map lessons to each topic.</p>
              </button>
            </CardBody>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default TeacherDashboard;