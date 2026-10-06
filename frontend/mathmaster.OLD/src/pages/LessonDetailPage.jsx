import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

function LessonDetailPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/learning/lessons/${lessonId}/`)
      .then((response) => setLesson(response.data))
      .catch((err) => setError(err.response?.data || err.message));
  }, [lessonId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <Navbar isLoggedIn />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {error && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{JSON.stringify(error)}</div>}
        {!lesson && !error && <div className="h-72 animate-pulse rounded-[2rem] border border-slate-200 bg-white/80" />}
        {lesson && (
          <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Lesson</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{lesson.title}</h1>
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-600">{lesson.content}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/lessons/${lesson.id}/quizzes`}
                className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View quizzes
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
              >
                Back to dashboard
              </Link>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

export default LessonDetailPage;
