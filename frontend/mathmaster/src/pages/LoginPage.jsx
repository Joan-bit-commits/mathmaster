import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
      console.error('Invalid username or password:', err.response?.status, err.response?.data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4 text-center">MathMaster</h1>
        <h2 className="text-3xl font-semibold text-slate-900 mb-6 text-center">Login to continue</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-white font-semibold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600 text-center">
          Don't have an account? <a href="/register" className="text-indigo-600 hover:underline">Register</a>
        </p>
        <button
          onClick={() => navigate('/register')}
          className="w-full mt-4 rounded-2xl bg-green-600 px-4 py-3 text-white font-semibold shadow-sm hover:bg-green-700 transition-colors"
        >
          Register
        </button>

        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
