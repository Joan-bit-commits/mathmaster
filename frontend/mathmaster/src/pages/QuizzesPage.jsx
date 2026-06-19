import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function QuizzesPage() {
  const { lessonId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/learning/lessons/${lessonId}/quizzes/`)
      .then((response) => setQuizzes(response.data))
      .catch((err) => setError(err.response?.data || err.message));
  }, [lessonId]);

  return (
    <div>
      <h1>Quizzes</h1>
      {error && <p style={{ color: 'red' }}>{JSON.stringify(error)}</p>}
      {quizzes.length === 0 && !error && <p>No quizzes found for this lesson.</p>}
      {quizzes.map((quiz) => (
        <div key={quiz.id}>
          <h3>
            <Link to={`/quizzes/${quiz.id}`}>{quiz.title}</Link>
          </h3>
          <p>{quiz.description}</p>
        </div>
      ))}
    </div>
  );
}

export default QuizzesPage;
