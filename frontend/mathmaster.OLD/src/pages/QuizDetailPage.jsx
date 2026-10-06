import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <Navbar isLoggedIn />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {error && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{JSON.stringify(error)}</div>}
        {!loading && !quiz && !error && <div className="h-72 animate-pulse rounded-[2rem] border border-slate-200 bg-white/80" />}

        {!loading && quiz && (
          <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Quiz</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{quiz.title}</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">{quiz.description}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {questions.map((question, index) => (
                <div key={question.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Question {index + 1}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{question.question_text}</p>
                  {question.choices && question.choices.length > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {question.choices.map((choice) => (
                        <label
                          key={choice}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                            answers[question.id] === choice
                              ? 'border-sky-300 bg-sky-50 text-sky-900'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={choice}
                            checked={answers[question.id] === choice}
                            onChange={() => handleChange(question.id, choice)}
                          />
                          {choice}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleChange(question.id, e.target.value)}
                      className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  )}
                </div>
              ))}

              <button type="submit" className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Submit attempt
              </button>
            </form>
          </section>
        )}

        {result && (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
            <h3 className="text-xl font-semibold">Attempt submitted</h3>
            <p className="mt-2">Score: {result.score}</p>
            <button
              onClick={() => navigate('/performance')}
              className="mt-4 inline-flex items-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              View performance
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default QuizDetailPage;
