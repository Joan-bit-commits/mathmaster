
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Badge, Card, CardBody, CardHeader, FeatureTile, ProgressBar } from '../components/ui';
import {
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  Calculator,
  ChevronRight,
  Coins,
  Crown,
  Flame,
  LayoutDashboard,
  LineChart,
  Medal,
  PlayCircle,
  Sigma,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';

function StudentDashboard() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  const primaryTopicPath = topics[0] ? `/topics/${topics[0].id}` : '/topics';

  const sidebarSections = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Math command center',
      icon: LayoutDashboard,
    },
    {
      id: 'topics',
      label: 'Topics',
      description: 'Concept library',
      icon: BookOpen,
    },
    {
      id: 'practice',
      label: 'Practice',
      description: 'Drills and quizzes',
      icon: Calculator,
    },
    {
      id: 'progress',
      label: 'Progress',
      description: 'Focus and momentum',
      icon: LineChart,
    },
    {
      id: 'tutor',
      label: 'AI tutor',
      description: 'Step-by-step help',
      icon: BrainCircuit,
    },
  ];

  const activeSectionMeta = {
    overview: {
      title: 'Overview',
      eyebrow: 'Math workspace',
      description: 'Keep one dashboard open while you move through concepts, practice, and review.',
    },
    topics: {
      title: 'Topics',
      eyebrow: 'Concept map',
      description: 'Browse the curriculum grid and jump into the lesson path for any topic.',
    },
    practice: {
      title: 'Practice',
      eyebrow: 'Solve and check',
      description: 'Open lesson drills, quizzes, and guided help without leaving the dashboard shell.',
    },
    progress: {
      title: 'Progress',
      eyebrow: 'Learning signal',
      description: 'Review your study rhythm, focus state, and the next step in your sequence.',
    },
    tutor: {
      title: 'AI tutor',
      eyebrow: 'Ask for help',
      description: 'Use the tutor page when a problem needs a second explanation or a worked solution.',
    },
  }[activeSection];

  const gamificationStats = [
    {
      label: 'Current streak',
      value: '15 Days',
      caption: 'Keep the rhythm alive.',
      icon: Flame,
      tone: 'text-amber-500',
    },
    {
      label: 'Total XP',
      value: '2,450',
      caption: 'Earned across lessons and quizzes.',
      icon: Sparkles,
      tone: 'text-sky-600',
    },
    {
      label: 'Scholar rank',
      value: 'Level 12',
      caption: 'You are climbing fast.',
      icon: Medal,
      tone: 'text-violet-600',
    },
    {
      label: 'Math coins',
      value: '450',
      caption: 'Spend on challenge boosts.',
      icon: Coins,
      tone: 'text-emerald-600',
    },
  ];

  const dailyQuests = [
    { title: 'Solve 10 algebra drills', reward: '+120 XP', progress: 70 },
    { title: 'Finish one lesson module', reward: '+80 XP', progress: 45 },
    { title: 'Ask the AI tutor 1 question', reward: '+50 XP', progress: 100 },
  ];

  const leaderboard = [
    { name: 'Sarah K.', xp: '12,400 XP', rank: 1, highlight: false, initials: 'SK' },
    { name: 'Alex Namuli (You)', xp: '11,250 XP', rank: 2, highlight: true, initials: 'AN' },
    { name: 'Brian O.', xp: '10,980 XP', rank: 3, highlight: false, initials: 'BO' },
  ];

  const badges = [
    { title: 'Top Solver', icon: Trophy, active: true, tone: 'text-amber-600', bg: 'bg-tertiary-fixed' },
    { title: '7-Day Streak', icon: Award, active: true, tone: 'text-emerald-600', bg: 'bg-secondary-fixed' },
    { title: 'Speed Demon', icon: Star, active: false, tone: 'text-slate-400', bg: 'bg-slate-100' },
  ];

  useEffect(() => {
    if (role === 'teacher') {
      navigate('/teacher-dashboard');
    }
  }, [role, navigate]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get('/api/learning/topics/');
        setTopics(response.data);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to fetch topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const renderSectionPanel = () => {
    if (activeSection === 'topics') {
      return (
        <Card>
          <CardHeader>
            <Badge tone="indigo">Topic grid</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Pick a topic and keep the flow moving.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              The sidebar stays fixed while you explore each topic card, so the dashboard feels like a control panel rather than a route change.
            </p>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
                ))}
              </div>
            ) : topics.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {topics.map((topic, index) => (
                  <Link
                    key={topic.id}
                    to={`/topics/${topic.id}`}
                    className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_24px_80px_rgba(14,165,233,0.15)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Topic {String(index + 1).padStart(2, '0')}</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-950">{topic.name}</h3>
                      </div>
                      <Badge tone={index < 2 ? 'emerald' : 'sky'}>{index < 2 ? 'Mastered' : 'Open'}</Badge>
                    </div>
                    <p className="mt-3 min-h-14 text-sm leading-6 text-slate-600">
                      {topic.description || 'Start with this concept and move through guided practice.'}
                    </p>
                    <div className="mt-4">
                      <ProgressBar value={Math.min(100, 30 + index * 14)} />
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition-transform group-hover:translate-x-1">
                      Explore topic <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center text-slate-600">
                No topics available yet.
              </div>
            )}
          </CardBody>
        </Card>
      );
    }

    if (activeSection === 'practice') {
      return (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <Badge tone="emerald">Practice loop</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Review, solve, and check your work in one flow.</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-7 text-slate-600">
              <p>
                This section is the study loop: use lessons for the explanation, quizzes for recall, and the tutor when the algebra gets stuck.
              </p>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Daily challenge</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">Win 200 XP before the day ends.</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Target className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {dailyQuests.map((quest) => (
                    <div key={quest.title}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-800">{quest.title}</span>
                        <span className="font-semibold text-sky-700">{quest.reward}</span>
                      </div>
                      <ProgressBar value={quest.progress} className="mt-2" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link to="/topics" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-sky-200 hover:bg-sky-50">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Concept review</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">Browse topics</p>
                  <p className="mt-2 text-sm text-slate-600">Return to the library and pick the next idea to master.</p>
                </Link>
                <Link to="/ai-tutor" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-sky-200 hover:bg-sky-50">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Guided help</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">Open tutor</p>
                  <p className="mt-2 text-sm text-slate-600">Ask for a step-by-step explanation when a solution needs more detail.</p>
                </Link>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Badge tone="amber">Quick links</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Jump into the rest of the math stack.</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Link to="/performance" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-amber-200 hover:bg-amber-50">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Performance review</p>
                  <p className="text-sm text-slate-600">Check scores, attempts, and recent quiz history.</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </Link>
              <Link to="/lessons/1/quizzes" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-amber-200 hover:bg-amber-50">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Quiz path</p>
                  <p className="text-sm text-slate-600">Open a quiz page and keep the evaluation cycle moving.</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </Link>
              <Link to="/topics" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-amber-200 hover:bg-amber-50">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Topic map</p>
                  <p className="text-sm text-slate-600">Return to the concept grid when you need a different chapter.</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </Link>
            </CardBody>
          </Card>
        </div>
      );
    }

    if (activeSection === 'progress') {
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          <FeatureTile title="Topics loaded" value={`${topics.length}`} caption="Available concepts in the curriculum library." tone="sky" />
          <FeatureTile title="Study flow" value="4 steps" caption="Review, solve, check, and repeat." tone="amber" />
          <FeatureTile title="Dashboard mode" value="Sidebar" caption="Switch panels without leaving the page." tone="ink" />
          <Card>
            <CardHeader>
              <Badge tone="emerald">Math signal</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Keep your learning path visible.</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-7 text-slate-600">
              <p>
                The dashboard is structured around study loops and concept groups, so the interface itself feels like a math notebook.
              </p>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Focus formula</p>
                <p className="mt-3 font-mono text-lg text-slate-950">understand + practice + reflect = progress</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Weekly goal</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">500 XP to the next milestone.</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Trophy className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar value={75} />
                </div>
                <p className="mt-3 text-sm text-slate-600">You are 75% done with this week’s target.</p>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    if (activeSection === 'tutor') {
      return (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <Badge tone="indigo">AI tutor</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Ask for step-by-step help when the math gets dense.</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Use the tutor page for worked examples, hints, or a different explanation of the same concept.
              </p>
              <Link
                to="/ai-tutor"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800"
              >
                Open tutor <ArrowRight className="h-4 w-4" />
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Badge tone="sky">Prompt ideas</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Good questions make better answers.</h2>
            </CardHeader>
            <CardBody className="space-y-3 text-sm leading-6 text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                “Explain this problem like I’m building the formula from scratch.”
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                “Show me the next step and why it is valid.”
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                “Give me a simpler example before we try the full version.”
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <Badge tone="sky">Overview</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Your dashboard is now a math workspace.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Use the side rail to switch views while staying on the same screen, like moving between tabs in a notebook.
            </p>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {gamificationStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div key={stat.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
                      <Icon className={`h-5 w-5 ${stat.tone}`} />
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">{stat.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{stat.caption}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,132,199,0.85))] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge tone="sky">Current lesson</Badge>
                    <h3 className="mt-4 text-2xl font-semibold">Senior 5 Calculus</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-200">Module 4: Differentiation fundamentals.</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                    <PlayCircle className="h-6 w-6 text-cyan-200" />
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/10 text-center">
                    <div>
                      <p className="text-2xl font-semibold">75%</p>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100">Done</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <ProgressBar value={75} className="bg-white/10" />
                    <p className="mt-3 text-sm leading-6 text-slate-200">Continue where you left off and collect the next XP milestone.</p>
                    <Link
                      to={primaryTopicPath}
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                    >
                      Continue learning
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Study tracker</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">2h 15m today</h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Target className="h-5 w-5" />
                  </div>
                </div>
                <ProgressBar value={66} />
                <p className="text-sm leading-6 text-slate-600">You are on track to hit your weekly study goal.</p>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Daily quest</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">Finish one module before sunset.</p>
                    </div>
                    <Crown className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {dailyQuests.slice(0, 2).map((quest) => (
                      <div key={quest.title}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-slate-800">{quest.title}</span>
                          <span className="font-semibold text-sky-700">{quest.reward}</span>
                        </div>
                        <ProgressBar value={quest.progress} className="mt-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Badges</p>
                    <Sparkles className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                    {badges.map((badge) => {
                      const Icon = badge.icon;

                      return (
                        <div
                          key={badge.title}
                          className={`flex-shrink-0 rounded-2xl border border-slate-200 p-3 text-center ${badge.bg} ${badge.active ? '' : 'opacity-45 grayscale'}`}
                        >
                          <Icon className={`mx-auto h-6 w-6 ${badge.tone}`} />
                          <p className="mt-2 text-[10px] font-bold leading-tight text-slate-900">{badge.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Uganda top 5</p>
                    <Crown className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="mt-3 space-y-3">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.name}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${entry.highlight ? 'bg-sky-50 ring-1 ring-sky-100' : 'bg-slate-50'}`}
                      >
                        <span className={`w-4 text-xs font-bold ${entry.rank === 1 ? 'text-amber-600' : entry.rank === 2 ? 'text-sky-600' : 'text-slate-400'}`}>
                          {entry.rank}
                        </span>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${entry.highlight ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {entry.initials}
                        </div>
                        <span className={`flex-1 truncate text-sm ${entry.highlight ? 'font-semibold text-slate-950' : 'text-slate-700'}`}>
                          {entry.name}
                        </span>
                        <span className={`text-xs font-bold ${entry.highlight ? 'text-sky-700' : 'text-slate-500'}`}>{entry.xp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <FeatureTile title="Topics ready" value={`${topics.length}`} caption="Loaded from the curriculum library." tone="sky" />
              <FeatureTile title="Study mode" value="Flow" caption="Focused navigation, faster review." tone="amber" />
              <FeatureTile title="Reward loop" value="XP + Coins" caption="Collect points while you learn." tone="ink" />
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden bg-slate-950 text-white">
          <CardHeader className="border-slate-800">
            <div className="flex items-center justify-between gap-3">
             <Badge tone="sky">Formula board</Badge>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                <Sigma className="h-4 w-4" /> Study math
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-semibold">f(x) = ax² + bx + c</h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-7 text-slate-300">
            <p>
              The dashboard uses a side rail for section switching, concept cards for topic discovery, and quick links for deeper pages.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Workflow</p>
                <p className="mt-2 text-base font-semibold text-white">Review and practice</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Navigation</p>
                <p className="mt-2 text-base font-semibold text-white">Stay on the same page</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <Navbar isLoggedIn />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-white">
                  Σ
                </span>
                <span className="font-mono normal-case tracking-normal">a² + b² = c²</span>
              </div>
              <Badge tone="sky">Student dashboard</Badge>
              <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Welcome back, {username || 'Student'}.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Use the sidebar to move through your math workspace while staying on the same page.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">f(x)</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Σ practice</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">√ progress</span>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Formula board</p>
                <Badge tone="sky">Focus mode</Badge>
              </div>
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Daily equation</p>
                <p className="mt-3 font-mono text-2xl font-semibold text-white">f(x) = ax² + bx + c</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  The dashboard works like a study notebook: concept map on the left, working space on the right.
                </p>
              </div>
              <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Graph sketch</p>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">y = x²</span>
                </div>
                <svg className="mt-3 h-28 w-full" viewBox="0 0 240 120" role="img" aria-label="Parabola diagram">
                  <defs>
                    <linearGradient id="studentParabola" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="240" height="120" rx="18" fill="rgba(255,255,255,0.03)" />
                  <line x1="20" y1="100" x2="220" y2="100" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                  <line x1="120" y1="16" x2="120" y2="108" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                  <path d="M 28 92 Q 120 20 212 92" fill="none" stroke="url(#studentParabola)" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="120" cy="20" r="4" fill="#22d3ee" />
                  <circle cx="76" cy="56" r="3" fill="#a5f3fc" />
                  <circle cx="164" cy="56" r="3" fill="#a5f3fc" />
                </svg>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to={primaryTopicPath}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Continue learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/performance"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
                >
                  View performance
                </Link>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="self-start rounded-[2rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:sticky lg:top-6">
            <div className="px-2 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Sidebar</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Study by section</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Switch panels without leaving the dashboard, then open a full page only when you need it.
              </p>
            </div>

            <div className="mt-3 space-y-2">
              {sidebarSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                      isActive
                        ? 'border-sky-200 bg-sky-50 text-slate-950 shadow-[0_16px_40px_rgba(14,165,233,0.12)]'
                        : 'border-transparent bg-slate-50/80 text-slate-600 hover:border-sky-100 hover:bg-sky-50/60 hover:text-slate-950'
                    }`}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isActive ? 'bg-white text-sky-600' : 'bg-white text-slate-500'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{section.label}</span>
                      <span className="block text-xs text-slate-500">{section.description}</span>
                    </span>
                    {isActive ? <ChevronRight className="h-4 w-4 text-sky-500" /> : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-[1.5rem] bg-slate-950 p-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Study cue</p>
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>
              <p className="mt-3 text-lg font-semibold">Keep the equation visible.</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Sidebars let you move through topics, practice, and progress while preserving context.
              </p>
            </div>
          </aside>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Badge tone="indigo">{activeSectionMeta.eyebrow}</Badge>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">{activeSectionMeta.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{activeSectionMeta.description}</p>
              </CardHeader>
              <CardBody>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <FeatureTile
                    title="Topics loaded"
                    value={`${topics.length}`}
                    caption="Concept cards available in your library."
                    tone="sky"
                  />
                  <FeatureTile
                    title="Current mode"
                    value="Focus"
                    caption="A dashboard shell that keeps the study flow together."
                    tone="amber"
                  />
                  <FeatureTile
                    title="Next action"
                    value="Explore"
                    caption="Pick a sidebar section or open a full page below."
                    tone="ink"
                  />
                </div>
              </CardBody>
            </Card>

            {renderSectionPanel()}
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;

