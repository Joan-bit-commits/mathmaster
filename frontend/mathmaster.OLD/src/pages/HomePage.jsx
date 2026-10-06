import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function HomePage() {
  const username = localStorage.getItem('username') || 'User';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <Navbar isLoggedIn />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Home</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Welcome, {username}.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">You are logged in and ready to continue learning.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to dashboard
            </Link>
            <Link
              to="/topics"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
            >
              Browse topics
            </Link>
            <Link
              to="/ai-tutor"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
            >
              Open AI tutor
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
