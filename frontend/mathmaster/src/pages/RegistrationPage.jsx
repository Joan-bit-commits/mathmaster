import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

function RegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    role: 'student',
  });
  const [error, setError] = useState('');

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
      const submitData = {
        username: formData.username,
        email: formData.email,
        password: formData.password1,
        password2: formData.password2,
        role: formData.role,
      };

      const response = await api.post('/api/accounts/register/', submitData);
      console.log('Registration successful:', response.data);

      if (response.data.access && response.data.refresh) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('username', formData.username);
        localStorage.setItem('role', formData.role);
        navigate('/dashboard');
      } else {
        navigate('/register-success');
      }
    } catch (error) {
      setError(error.response?.data?.detail || error.response?.data || error.message);
      console.error('Registration failed:', error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-md flex-col rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">MathMaster</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Set up a profile for personalized lessons and progress tracking.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password1"
              value={formData.password1}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password2">Confirm Password</label>
            <input
              id="password2"
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <Button type="submit" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-white hover:bg-slate-800">
            Create Account
          </Button>
        </form>

        {error && <p className="mt-4 text-center text-sm text-rose-600">{JSON.stringify(error)}</p>}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-sky-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegistrationPage;
