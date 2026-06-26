import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/api/accounts/login/', formData);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', formData.username);

      try {
        const profileResponse = await api.get('/api/accounts/profile/');
        localStorage.setItem('role', profileResponse.data.role);
        localStorage.setItem('userId', profileResponse.data.id);
      } catch {
        console.log('Could not fetch profile, but login successful');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
      console.error('Invalid username or password:', err.response?.status, err.response?.data);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-md flex-col rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">MathMaster</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Login to continue</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Pick up your lessons, quizzes, and progress where you left off.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
            />
          </div>

          <Button type="submit" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-white hover:bg-slate-800">
            Login
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-sky-700 hover:underline">
            Register
          </Link>
        </p>

        <button
          onClick={() => navigate('/register')}
          className="mt-4 w-full rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700"
        >
          Register
        </button>

        {error && <p className="mt-4 text-center text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
