import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

function QuizzesPage() {
  const { lessonId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/learning/lessons/${lessonId}/quizzes/`)
      .then((response) => setQuizzes(response.data))
      .catch((err) => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <Navbar isLoggedIn />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Quizzes</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Test what you know</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Choose a quiz, submit your answers, and check your performance.</p>
        </section>

        {error && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{JSON.stringify(error)}</div>}

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
            <div className="h-24 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
          </div>
        ) : quizzes.length === 0 && !error ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-600">
            No quizzes found for this lesson.
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                to={`/quizzes/${quiz.id}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-sky-200"
              >
                <h3 className="text-xl font-semibold text-slate-950">{quiz.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{quiz.description}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default QuizzesPage;
