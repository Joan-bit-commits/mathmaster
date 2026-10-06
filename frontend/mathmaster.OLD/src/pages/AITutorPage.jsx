import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Badge, Button, Card, CardBody, CardHeader } from '../components/ui';

function AITutorPage() {
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [level, setLevel] = useState(localStorage.getItem('role') || '');
  const [context, setContext] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/learning/topics/')
      .then((response) => {
        const topicList = response.data || [];
        setTopics(topicList);
        if (topicList.length > 0) {
          setTopic(String(topicList[0].name || ''));
        }
      })
      .catch(() => {
        setTopics([]);
      });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await api.post('/api/ai-tutor/ask-ai-tutor/', {
        topic,
        question,
        level,
        context,
      });

      setAnswer(response.data?.answer || 'No answer returned.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get an AI tutor response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-noise text-slate-950">
      <Navbar isLoggedIn />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="section-divider mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <Badge tone="sky">AI Tutor</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Ask a math question and get guided help.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Use this space for step-by-step explanations, worked examples, and quick practice support.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-slate-950">Send a question</h2>
            </CardHeader>
            <CardBody>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Topic</span>
                  <select
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-300"
                  >
                    <option value="">Select a topic</option>
                    {topics.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Question</span>
                  <textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    rows={5}
                    placeholder="Type the problem you want help with..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-300"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Level</span>
                    <input
                      type="text"
                      value={level}
                      onChange={(event) => setLevel(event.target.value)}
                      placeholder="e.g. P7, S2, S4"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-300"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Extra context</span>
                    <input
                      type="text"
                      value={context}
                      onChange={(event) => setContext(event.target.value)}
                      placeholder="Optional hint, worksheet text, or instruction"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-300"
                    />
                  </label>
                </div>

                {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{error}</div>}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={loading || !topic || !question.trim()}>
                    {loading ? 'Thinking...' : 'Ask AI tutor'}
                  </Button>
                  <Link to="/dashboard">
                    <Button variant="secondary" type="button">Back to dashboard</Button>
                  </Link>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-slate-950">Answer</h2>
            </CardHeader>
            <CardBody>
              {answer ? (
                <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {answer}
                </div>
              ) : (
                <p className="text-sm leading-7 text-slate-600">
                  Your AI tutor response will appear here after you send a question.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default AITutorPage;