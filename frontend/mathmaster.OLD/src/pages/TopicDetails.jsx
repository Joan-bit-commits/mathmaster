import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Badge, Button, Card, CardBody, CardFooter, CardHeader } from '../components/ui';

function TopicDetails() {
  const { topicId } = useParams();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get('/api/learning/topics/');
        setTopics(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const selectedTopic = useMemo(() => {
    if (topics.length === 0) {
      return null;
    }

    const match = topicId ? topics.find((topic) => String(topic.id) === String(topicId)) : null;
    return match || topics[0];
  }, [topics, topicId]);

  const activeIndex = useMemo(
    () => topics.findIndex((topic) => topic.id === selectedTopic?.id),
    [topics, selectedTopic],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <Navbar isLoggedIn={Boolean(localStorage.getItem('access_token'))} />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <Badge tone="indigo">Learning library</Badge>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Topics that build confidence fast.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Pick a topic, review the lesson sequence, and jump straight into practice.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard">
                <Button variant="secondary">Back to dashboard</Button>
              </Link>
              {selectedTopic ? (
                <Link to={`/topics/${selectedTopic.id}/lessons`}>
                  <Button>Open lessons</Button>
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        {error ? (
          <Card className="border-rose-200 bg-rose-50/90">
            <CardBody>
              <p className="font-semibold text-rose-700">{error}</p>
            </CardBody>
          </Card>
        ) : null}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <Card>
              <CardBody>
                <p className="text-slate-600">Loading topics...</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-slate-600">Preparing topic details...</p>
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {topics.map((topic) => {
                const active = topic.id === selectedTopic?.id;

                return (
                  <Link
                    key={topic.id}
                    to={`/topics/${topic.id}`}
                    className={`block text-left transition duration-200 ${active ? 'scale-[1.01]' : 'hover:-translate-y-1'}`}
                  >
                    <Card className={active ? 'ring-2 ring-sky-400' : ''}>
                      <CardHeader className="border-transparent pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Topic {topic.id}</p>
                            <h2 className="mt-1 text-lg font-semibold text-slate-950">{topic.name}</h2>
                          </div>
                          <Badge tone={active ? 'emerald' : 'slate'}>{active ? 'Selected' : 'Open'}</Badge>
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-4">
                        <p className="line-clamp-4 text-sm leading-6 text-slate-600">
                          {topic.description || 'A structured path from concept review to quiz practice.'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{activeIndex >= 0 ? `Rank ${activeIndex + 1}` : 'Ready to explore'}</span>
                          <span>Lessons available</span>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <Card className="sticky top-24 h-fit">
              <CardHeader className="border-transparent">
                <Badge tone="indigo">Topic details</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                  {selectedTopic ? selectedTopic.name : 'Pick a topic'}
                </h2>
              </CardHeader>
              <CardBody className="space-y-6">
                {selectedTopic ? (
                  <>
                    <p className="text-sm leading-7 text-slate-600">
                      {selectedTopic.description || 'No description provided yet.'}
                    </p>
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">What you can do next</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        <li>Review the lesson sequence.</li>
                        <li>Practice with topic quizzes.</li>
                        <li>Track performance after each attempt.</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">Choose a topic from the list to see more detail.</p>
                )}
              </CardBody>
              <CardFooter className="flex flex-wrap gap-3 border-transparent pt-0">
                {selectedTopic ? (
                  <>
                    <Link to={`/topics/${selectedTopic.id}/lessons`}>
                      <Button>View lessons</Button>
                    </Link>
                    <Link to={`/topics/${selectedTopic.id}/lessons`}>
                      <Button variant="secondary">Start learning</Button>
                    </Link>
                  </>
                ) : null}
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default TopicDetails;