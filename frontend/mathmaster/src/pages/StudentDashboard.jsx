import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/learning/topics/');
        console.log(response.data);
        setTopics(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gray-100">
      {error && <p className="text-red-500 mt-8 text-center">Error: {error}</p>}
      <nav className="bg-blue-500 text-white py-4 px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">MathMaster</h1>
            <ul className="flex items-center">
              <li className="mx-4"><Link to="/" className="text-gray-200 hover:text-gray-100">Home</Link></li>
              <li className="mx-4"><Link to="/courses" className="text-gray-200 hover:text-gray-100">Courses</Link></li>
              <li className="mx-4"><Link to="/profile" className="text-gray-200 hover:text-gray-100">Profile</Link></li>
              <li className="mx-4"><Link to="/settings" className="text-gray-200 hover:text-gray-100">Settings</Link></li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold text-blue-500">Welcome to the MathMaster Student Dashboard</h1>
        <p className="mt-4 text-gray-600">Here you can access all your courses, view your progress, and manage your account.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-500">My Courses</h2>
            <ul className="mt-4">
              {topics.map((topic) => (
                <li key={topic.id} className="text-gray-600 hover:text-gray-900"><Link to={`/courses/${topic.id}`}>{topic.name}</Link></li>
              ))}
            </ul>
          </div>
          <div className="bg-white shadow-lg p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-500">My Progress</h2>
            <p className="mt-4 text-gray-600">Track your progress across all topics and see your completion status.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

