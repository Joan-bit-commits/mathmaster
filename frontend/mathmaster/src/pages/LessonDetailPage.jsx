import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function LessonDetailPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/learning/lessons/${lessonId}/`)
      .then((response) => setLesson(response.data))
      .catch((err) => setError(err.response?.data || err.message));
  }, [lessonId]);

  return (
    <div>
      <h1>Lesson</h1>
      {error && <p style={{ color: 'red' }}>{JSON.stringify(error)}</p>}
      {!lesson && !error && <p>Loading lesson...</p>}
      {lesson && (
        <>
          <h2>{lesson.title}</h2>
          <p>{lesson.content}</p>
          <Link to={`/lessons/${lesson.id}/quizzes`}>View quizzes</Link>
        </>
      )}
    </div>
  );
}

export default LessonDetailPage;
