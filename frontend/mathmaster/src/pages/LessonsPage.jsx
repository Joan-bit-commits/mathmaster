import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function LessonsPage() {
  const { topicId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/learning/topics/${topicId}/lessons/`)
      .then((response) => setLessons(response.data))
      .catch((err) => setError(err.response?.data || err.message));
  }, [topicId]);

  return (
    <div>
      <h1>Lessons</h1>
      {error && <p style={{ color: 'red' }}>{JSON.stringify(error)}</p>}
      {lessons.length === 0 && !error && <p>No lessons found for this topic.</p>}
      {lessons.map((lesson) => (
        <div key={lesson.id}>
          <h3>
            <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
          </h3>
          <p>{lesson.content.substring(0, 120)}...</p>
        </div>
      ))}
    </div>
  );
}

export default LessonsPage;
