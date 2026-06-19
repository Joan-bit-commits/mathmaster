import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function RegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');

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
      const response = await api.post('/api/accounts/register/', formData);
      console.log('Registration successful:', response.data);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data || error.message);
      console.error('Registration failed:', error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4 text-center">MathMaster</h1>
        <h2 className="text-3xl font-semibold text-slate-900 mb-6 text-center">Register</h2>
        <p className="mb-6 text-sm text-slate-600 text-center">Create an account to access personalized learning paths and track your progress.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
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
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-white font-semibold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Create Account
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600 text-center">{JSON.stringify(error)}</p>}

        <p className="mt-6 text-sm text-slate-600 text-center">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-indigo-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegistrationPage;
