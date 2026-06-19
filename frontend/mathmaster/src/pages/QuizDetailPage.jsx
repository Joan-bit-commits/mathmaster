import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function QuizDetailPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/api/learning/quizzes/${quizId}/`)
      .then((response) => setQuiz(response.data))
      .catch((err) => setError(err.response?.data || err.message));

    api.get(`/api/learning/quizzes/${quizId}/questions/`)
      .then((response) => setQuestions(response.data))
      .catch((err) => setError(err.response?.data || err.message));
  }, [quizId]);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      answers: Object.entries(answers).map(([question, answer]) => ({
        question: Number(question),
        answer,
      })),
    };

    try {
      const response = await api.post(`/api/learning/quizzes/${quizId}/attempts/`, payload);
      setResult(response.data);
      setError('');
      navigate('/performance');
    } catch (err) {
      setError(err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h1>Quiz</h1>
      {error && <p style={{ color: 'red' }}>{JSON.stringify(error)}</p>}
      {!quiz && !error && <p>Loading quiz...</p>}
      {quiz && (
        <>
          <h2>{quiz.title}</h2>
          <p>{quiz.description}</p>
          <form onSubmit={handleSubmit}>
            {questions.map((question) => (
              <div key={question.id}>
                <p>{question.question_text}</p>
                {question.choices && question.choices.length > 0 ? (
                  question.choices.map((choice) => (
                    <label key={choice} style={{ display: 'block' }}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={choice}
                        checked={answers[question.id] === choice}
                        onChange={() => handleChange(question.id, choice)}
                      />
                      {choice}
                    </label>
                  ))
                ) : (
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                  />
                )}
              </div>
            ))}
            <button type="submit">Submit Attempt</button>
          </form>
        </>
      )}
      {result && (
        <div>
          <h3>Attempt submitted</h3>
          <p>Score: {result.score}</p>
          <button onClick={() => navigate('/performance')}>View performance</button>
        </div>
      )}
    </div>
  );
}

export default QuizDetailPage;
