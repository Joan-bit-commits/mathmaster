
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Badge, FeatureTile } from '../components/ui';

function StudentDashboard() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role === 'teacher') {
      navigate('/teacher-dashboard');
    }
  }, [role, navigate]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get('/api/learning/topics/');
        setTopics(response.data);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to fetch topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return (
    <div className="min-h-screen app-noise text-slate-950">
      <Navbar isLoggedIn />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="section-divider mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <Badge tone="sky">Student dashboard</Badge>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Welcome back, {username || 'Student'}.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Choose a topic, follow the lesson path, and keep your progress moving forward.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <FeatureTile
                title="Learning streak"
                value="8 lessons"
                caption="Completed this week with steady quiz practice."
                tone="sky"
              />
              <FeatureTile
                title="Focus area"
                value="Algebra"
                caption="The next topic in your learning sequence."
                tone="amber"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <Link
                    key={topic.id}
                    to={`/topics/${topic.id}`}
                    className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_24px_80px_rgba(14,165,233,0.15)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Topic</p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950">{topic.name}</h2>
                    <p className="mt-3 min-h-14 text-sm leading-6 text-slate-600">
                      {topic.description || 'Start here to build understanding and practice.'}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition-transform group-hover:translate-x-1">
                      Start learning <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                ))
              ) : (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white/80 py-12 text-center">
                  <p className="text-lg text-slate-600">No topics available yet.</p>
                </div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">My progress</p>
                <h2 className="mt-3 text-2xl font-semibold">Track your learning streak</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Keep an eye on completed lessons, quiz scores, and what to do next.
                </p>
                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-amber-300" />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                  <span>68% complete</span>
                  <span>8 lessons done</span>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                <h2 className="text-2xl font-semibold text-slate-950">Quick actions</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Jump back into the learning flow or review your results.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Link to="/topics" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-sky-200 hover:bg-sky-50">
                    <h3 className="text-lg font-semibold text-slate-950">Browse topics</h3>
                    <p className="mt-2 text-sm text-slate-600">Explore all available learning paths.</p>
                  </Link>

                  <Link to="/performance" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-sky-200 hover:bg-sky-50">
                    <h3 className="text-lg font-semibold text-slate-950">View performance</h3>
                    <p className="mt-2 text-sm text-slate-600">Review your scores and attempts.</p>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;

