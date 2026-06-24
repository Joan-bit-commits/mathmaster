import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  useEffect(() => {
    // Redirect if not a teacher
    if (role && role !== 'teacher') {
      navigate('/dashboard');
      return;
    }

    const fetchTeacherData = async () => {
      try {
        const response = await api.get('/api/accounts/profile/');
        setTeacher(response.data);
      } catch (err) {
        setError('Failed to load teacher profile');
        console.error('Error fetching teacher data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [role, navigate]);

  // Redirect teachers to teacher dashboard
  useEffect(() => {
    if (role === 'teacher') {
      navigate('/teacher-dashboard');
    }
  }, [role, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isLoggedIn={true} />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={true} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back {username}!</h1>
          <p className="text-lg text-gray-600">Manage your courses and students</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Teacher Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">Teacher Profile</h2>
            {teacher ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="text-lg font-semibold text-gray-900">{teacher.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{teacher.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{teacher.role}</p>
                </div>
                {teacher.first_name && (
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {teacher.first_name} {teacher.last_name || ''}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Unable to load profile</p>
            )}
          </div>

          {/* Classes Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">My Classes</h2>
            <div className="space-y-2">
              <p className="text-gray-600">Coming soon</p>
              <ul className="space-y-2">
                <li className="p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100">
                  <p className="font-semibold text-gray-700">Mathematics 101</p>
                  <p className="text-sm text-gray-600">25 Students</p>
                </li>
                <li className="p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100">
                  <p className="font-semibold text-gray-700">Advanced Calculus</p>
                  <p className="text-sm text-gray-600">18 Students</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Student Analytics Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">Student Analytics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Students</span>
                <span className="font-semibold text-gray-900">43</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Progress</span>
                <span className="font-semibold text-green-600">75%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active This Week</span>
                <span className="font-semibold text-blue-600">31</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                Create New Class
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Create Assignment
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                View Reports
              </button>
            </div>
          </div>

          {/* Resources Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">Resources</h2>
            <ul className="space-y-2">
              <li className="text-blue-600 hover:underline cursor-pointer">📚 Learning Materials</li>
              <li className="text-blue-600 hover:underline cursor-pointer">📊 Grading Guide</li>
              <li className="text-blue-600 hover:underline cursor-pointer">❓ Help & Support</li>
              <li className="text-blue-600 hover:underline cursor-pointer">⚙️ Settings</li>
            </ul>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">Recent Activity</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">📝 5 students submitted assignments</p>
              <p className="text-gray-600">✅ Graded 12 assignments</p>
              <p className="text-gray-600">💬 Replied to 8 student questions</p>
              <p className="text-gray-600">📈 3 classes completed</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard;