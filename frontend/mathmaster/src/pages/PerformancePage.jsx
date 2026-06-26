import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

function PerformancePage() {
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/learning/performance/')
      .then((response) => setAttempts(response.data))
      .catch((err) => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <Navbar isLoggedIn />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Performance</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Review your quiz history</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">See recent attempts, scores, and when you completed them.</p>
        </section>

        {error && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{JSON.stringify(error)}</div>}

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
            <div className="h-24 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
          </div>
        ) : attempts.length === 0 && !error ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-600">
            No performance attempts found.
          </div>
        ) : (
          <div className="grid gap-4">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Quiz</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950">{attempt.quiz_title}</h2>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    {attempt.score}%
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">Attempted at {new Date(attempt.attempted_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PerformancePage;
