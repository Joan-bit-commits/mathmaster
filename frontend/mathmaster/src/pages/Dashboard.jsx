import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/learning/topics/')
      .then((response) => {
        console.log(response.data);
        setTopics(response.data);
      })
      .catch((err) => {
        const message = err.response?.data?.detail || err.response?.data || err.message;
        setError(message);
        console.error('Topics fetch failed:', message);
      });
  }, []);
  
  return (
    <div>
      <h1>Welcome to MathMaster</h1>
      <h2>Available Topics</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {topics.length === 0 && !error && <p>No topics found.</p>}
      {topics.map((topic) => (
        <div key={topic.id}>
          <h3>{topic.name}</h3>
          <p>{topic.description}</p>
          <Link to={`/topics/${topic.id}/lessons`}>View lessons</Link>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
