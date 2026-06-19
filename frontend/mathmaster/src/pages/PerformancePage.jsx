import { useEffect, useState } from 'react';
import api from '../services/api';

function PerformancePage() {
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/learning/performance/')
      .then((response) => setAttempts(response.data))
      .catch((err) => setError(err.response?.data || err.message));
  }, []);

  return (
    <div>
      <h1>Performance</h1>
      {error && <p style={{ color: 'red' }}>{JSON.stringify(error)}</p>}
      {attempts.length === 0 && !error && <p>No performance attempts found.</p>}
      {attempts.map((attempt) => (
        <div key={attempt.id}>
          <p>Quiz: {attempt.quiz_title}</p>
          <p>Score: {attempt.score}%</p>
          <p>Attempted at: {new Date(attempt.attempted_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default PerformancePage;
