
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

function StudentDashboard() {
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  // Redirect teachers
  useEffect(() => {
    if (role === 'teacher') {
      navigate('/teacher-dashboard');
    }
  }, [role, navigate]);

  // Fetch topics
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
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={true} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {username || 'Student'}!
          </h1>

          <p className="text-lg text-gray-600">
            Choose a topic to start learning.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading topics...</p>
          </div>
        ) : (
          <>
            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                  >
                    <h2 className="text-xl font-bold text-indigo-600 mb-3">
                      {topic.name}
                    </h2>

                    {topic.description && (
                      <p className="text-gray-600 mb-4">
                        {topic.description}
                      </p>
                    )}

                    <Link
                      to={`/topics/${topic.id}/lessons`}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Start Learning →
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">
                    No topics available yet.
                  </p>
                </div>
              )}
            </div>

            {/* Progress Section */}
            <div className="bg-white shadow-lg p-8 rounded-lg mb-10">
              <h2 className="text-2xl font-bold text-blue-500">
                My Progress
              </h2>

              <p className="text-gray-600 mt-2">
                Check your progress and keep track of your learning journey.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mt-10 bg-white shadow-lg p-8 rounded-lg">
              <h2 className="text-blue-500 text-2xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/topics"
                  className="bg-white rounded-lg shadow-md p-4 hover:bg-indigo-600 hover:text-white transition-colors duration-300"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    Browse Topics
                  </h3>

                  <p>
                    Explore all available learning topics.
                  </p>
                </Link>

                <Link
                  to="/dashboard"
                  className="bg-white rounded-lg shadow-md p-4 hover:bg-indigo-600 hover:text-white transition-colors duration-300"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    View Dashboard
                  </h3>

                  <p>
                    Track your learning progress and achievements.
                  </p>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;

