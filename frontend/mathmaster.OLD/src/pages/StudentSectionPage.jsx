import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  Download,
  LayoutDashboard,
  Megaphone,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  UserRound,
  ChartColumnIncreasing,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Badge, Button, Card, CardBody, CardHeader, ProgressBar } from '../components/ui';
import { useStudentDashboardData } from '../components/student-dashboard/studentDashboardData';

const SECTION_CONFIG = {
  profile: {
    badge: 'My Profile',
    title: 'Student profile summary',
    description: 'A clean overview of your identity, study pattern, and account details.',
    icon: UserRound,
  },
  activities: {
    badge: 'Log Activities',
    title: 'Track study and placement activity',
    description: 'Capture the work you complete so your dashboard has a real activity history.',
    icon: ClipboardList,
  },
  placement: {
    badge: 'Internship / Placement',
    title: 'Placement readiness and applications',
    description: 'Manage your internship progress and keep application drafts in one place.',
    icon: BriefcaseBusiness,
  },
  evaluations: {
    badge: 'Evaluations',
    title: 'Review and request feedback',
    description: 'Prepare evaluation notes, review recent attempts, and request follow-up when needed.',
    icon: BadgeCheck,
  },
  endorsements: {
    badge: 'Endorsements',
    title: 'Request references and endorsements',
    description: 'Save endorsement requests for teachers, mentors, or supervisors.',
    icon: Megaphone,
  },
  calendar: {
    badge: 'Calendar',
    title: 'Upcoming activities and reminders',
    description: 'Keep a practical schedule for lessons, quizzes, and application deadlines.',
    icon: CalendarDays,
  },
  notifications: {
    badge: 'Notifications',
    title: 'Your current alerts',
    description: 'Read system messages, recent scores, and helpful next-step prompts.',
    icon: Bell,
  },
  reports: {
    badge: 'Reports / Progress',
    title: 'Performance reports and exports',
    description: 'Download a simple report built from your actual profile, topics, and quiz attempts.',
    icon: ChartColumnIncreasing,
  },
  settings: {
    badge: 'Settings',
    title: 'Account preferences',
    description: 'Adjust your student workspace defaults and sign out when you are finished.',
    icon: Settings2,
  },
};

function readStoredList(key, fallback = []) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredList(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function SectionEmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-sky-500" />
      <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      {actionLabel ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function StudentSectionPage({ section }) {
  const navigate = useNavigate();
  const dashboard = useStudentDashboardData();
  const config = SECTION_CONFIG[section] || SECTION_CONFIG.profile;
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState({});
  const [localNotifications, setLocalNotifications] = useState([]);

  const clearMessage = () => setMessage('');

  const handleSaveActivity = () => {
    const entries = readStoredList(dashboard.storageKeys.activities, []);
    const nextEntry = {
      id: Date.now(),
      type: formState.activityType || 'Study session',
      duration: formState.duration || '45 minutes',
      notes: formState.notes || 'Focused practice session.',
      createdAt: new Date().toISOString(),
    };

    writeStoredList(dashboard.storageKeys.activities, [nextEntry, ...entries].slice(0, 12));
    setMessage('Activity saved locally and reflected in the activity log.');
    setFormState({});
    dashboard.refresh();
  };

  const handleSaveReminder = () => {
    const reminders = readStoredList(dashboard.storageKeys.reminders, []);
    const nextReminder = {
      id: Date.now(),
      title: formState.reminderTitle || 'Follow up on math revision',
      time: formState.reminderTime || 'This week',
      label: 'Reminder',
      tone: 'emerald',
    };

    writeStoredList(dashboard.storageKeys.reminders, [nextReminder, ...reminders].slice(0, 10));
    setMessage('Calendar reminder saved locally.');
    setFormState({});
    dashboard.refresh();
  };

  const handleSaveEvaluation = () => {
    const requests = readStoredList(dashboard.storageKeys.evaluationRequests, []);
    const request = {
      id: Date.now(),
      title: formState.evaluationTitle || 'General evaluation review',
      notes: formState.evaluationNotes || 'Please review the recent attempt and advise on next steps.',
      createdAt: new Date().toISOString(),
    };

    writeStoredList(dashboard.storageKeys.evaluationRequests, [request, ...requests].slice(0, 8));
    setMessage('Evaluation request saved locally.');
    setFormState({});
  };

  const handleSaveEndorsement = () => {
    const endorsements = readStoredList(dashboard.storageKeys.endorsements, []);
    const request = {
      id: Date.now(),
      referee: formState.referee || 'Academic mentor',
      reason: formState.reason || 'Requesting endorsement for an internship application.',
      createdAt: new Date().toISOString(),
    };

    writeStoredList(dashboard.storageKeys.endorsements, [request, ...endorsements].slice(0, 8));
    setMessage('Endorsement request saved locally.');
    setFormState({});
  };

  const handleToggleSetting = (settingKey) => {
    const nextSettings = {
      ...dashboard.settings,
      [settingKey]: !dashboard.settings[settingKey],
    };

    dashboard.persistSettings(nextSettings);
    setMessage('Settings updated.');
    dashboard.refresh();
  };

  const handleMarkAllSeen = () => {
    setLocalNotifications([]);
    setMessage('Notifications cleared from this view.');
  };

  const handleDownload = () => {
    dashboard.downloadReport();
    setMessage('Report download started.');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const renderedContent = () => {
    if (dashboard.loading) {
      return <div className="h-72 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white/80" />;
    }

    if (dashboard.error) {
      return (
        <Card className="border-rose-200 bg-rose-50/90">
          <CardBody>
            <p className="font-semibold text-rose-700">{dashboard.error}</p>
            <Button className="mt-4" variant="secondary" onClick={dashboard.refresh}>
              Retry loading
            </Button>
          </CardBody>
        </Card>
      );
    }

    switch (section) {
      case 'profile':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <Badge tone="sky">Profile snapshot</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Account details at a glance</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Name</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{dashboard.profile?.first_name || dashboard.profile?.username || 'Student'}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Role</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{dashboard.profile?.role || 'student'}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Email</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{dashboard.profile?.email || 'No email on file'}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Recent score</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{dashboard.stats.averageScore}% average</p>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <p className="text-sm leading-7 text-slate-600">
                    Your profile is tied to the same account that powers the dashboard, quizzes, and AI tutor.
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Badge tone="emerald">Current progress</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Summary and next step</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <ProgressBar value={dashboard.stats.progress} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Topics</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{dashboard.stats.topicCount}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Attempts</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{dashboard.stats.attemptCount}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => navigate('/settings')}>Edit preferences</Button>
                  <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        );

      case 'activities':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <Badge tone="sky">New activity</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Record what you worked on</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Activity type</span>
                    <input
                      value={formState.activityType || ''}
                      onChange={(event) => setFormState((current) => ({ ...current, activityType: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                      placeholder="Study session, quiz review, placement work"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Duration</span>
                    <input
                      value={formState.duration || ''}
                      onChange={(event) => setFormState((current) => ({ ...current, duration: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                      placeholder="45 minutes"
                    />
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Notes</span>
                  <textarea
                    value={formState.notes || ''}
                    onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Add a short note about the work completed."
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleSaveActivity} disabled={!(formState.activityType || formState.notes)}>
                    <Save className="h-4 w-4" />
                    Save activity
                  </Button>
                  <Button variant="secondary" onClick={() => setFormState({})}>Reset</Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Badge tone="amber">Activity log</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Recent saved entries</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                {dashboard.savedActivities.length > 0 ? (
                  dashboard.savedActivities.map((entry) => (
                    <div key={entry.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-950">{entry.type}</p>
                      <p className="mt-1 text-sm text-slate-600">{entry.duration}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{entry.notes}</p>
                    </div>
                  ))
                ) : (
                  <SectionEmptyState
                    title="No activities logged yet"
                    description="Record the first study session and the log will appear here."
                    actionLabel="Back to dashboard"
                    onAction={() => navigate('/dashboard')}
                  />
                )}
              </CardBody>
            </Card>
          </div>
        );

      case 'placement':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <Badge tone="sky">Placement readiness</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Monitor internship progress</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <ProgressBar value={dashboard.stats.placementProgress} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Readiness</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{dashboard.stats.placementProgress}%</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Recommended next step</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">Submit a placement application draft</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Badge tone="emerald">Application draft</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Save your placement notes</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Target organization</span>
                  <input
                    value={formState.company || ''}
                    onChange={(event) => setFormState((current) => ({ ...current, company: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Company or school partner"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Focus area</span>
                  <input
                    value={formState.role || ''}
                    onChange={(event) => setFormState((current) => ({ ...current, role: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Data analysis, tutoring, product support"
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      const reminders = readStoredList(dashboard.storageKeys.reminders, []);
                      writeStoredList(dashboard.storageKeys.reminders, [
                        { title: `${formState.company || 'Placement'} draft saved`, time: 'Saved locally', label: 'Placement', tone: 'sky' },
                        ...reminders,
                      ].slice(0, 10));
                      setMessage('Placement draft saved locally.');
                      setFormState({});
                      dashboard.refresh();
                    }}
                  >
                    <Save className="h-4 w-4" />
                    Save draft
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/settings')}>Placement settings</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        );

      case 'evaluations':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <Badge tone="sky">Evaluation review</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Capture feedback requests</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Evaluation title</span>
                  <input
                    value={formState.evaluationTitle || ''}
                    onChange={(event) => setFormState((current) => ({ ...current, evaluationTitle: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Quiz review, project review, internship reflection"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Notes</span>
                  <textarea
                    rows={4}
                    value={formState.evaluationNotes || ''}
                    onChange={(event) => setFormState((current) => ({ ...current, evaluationNotes: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Summarize what you want reviewed."
                  />
                </label>
                <Button onClick={handleSaveEvaluation} disabled={!formState.evaluationTitle && !formState.evaluationNotes}>
                  <Save className="h-4 w-4" />
                  Save request
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Badge tone="emerald">Recent attempts</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Use the real quiz history</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                {dashboard.recentActivities.length > 0 ? (
                  dashboard.recentActivities.map((item) => (
                    <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    </div>
                  ))
                ) : (
                  <SectionEmptyState
                    title="No attempts yet"
                    description="Open a topic, complete a quiz, and the performance history will appear here."
                    actionLabel="Open performance"
                    onAction={() => navigate('/performance')}
                  />
                )}
              </CardBody>
            </Card>
          </div>
        );

      case 'endorsements':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <Badge tone="sky">Request endorsement</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Keep reference notes ready</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Referee</span>
                  <input
                    value={formState.referee || ''}
                    onChange={(event) => setFormState((current) => ({ ...current, referee: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Teacher, mentor, or supervisor"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Why this endorsement?</span>
                  <textarea
                    rows={4}
                    value={formState.reason || ''}
                    onChange={(event) => setFormState((current) => ({ ...current, reason: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Describe the application or opportunity."
                  />
                </label>
                <Button onClick={handleSaveEndorsement} disabled={!formState.referee && !formState.reason}>
                  <Save className="h-4 w-4" />
                  Save endorsement request
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Badge tone="emerald">Recent requests</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Saved locally for now</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                {readStoredList(dashboard.storageKeys.endorsements, []).length > 0 ? (
                  readStoredList(dashboard.storageKeys.endorsements, []).map((entry) => (
                    <div key={entry.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-950">{entry.referee}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{entry.reason}</p>
                    </div>
                  ))
                ) : (
                  <SectionEmptyState
                    title="No endorsement requests yet"
                    description="Create one if you need a reference for placement or an academic opportunity."
                    actionLabel="Open dashboard"
                    onAction={() => navigate('/dashboard')}
                  />
                )}
              </CardBody>
            </Card>
          </div>
        );

      case 'calendar':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <Badge tone="sky">Upcoming activities</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Your calendar view</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                {dashboard.calendarEvents.length > 0 ? (
                  dashboard.calendarEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-950">{event.title}</p>
                        <p className="text-sm text-slate-500">{event.time}</p>
                      </div>
                      <Badge tone={event.tone || 'sky'}>{event.label}</Badge>
                    </div>
                  ))
                ) : (
                  <SectionEmptyState
                    title="No calendar items yet"
                    description="Create a reminder to keep track of your work and deadlines."
                    actionLabel="Add reminder"
                    onAction={handleSaveReminder}
                  />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Badge tone="emerald">Reminder draft</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Add a follow-up note</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Reminder title</span>
                  <input
                    value={formState.reminderTitle || ''}
                    onChange={(event) => setFormState((current) => ({ ...current, reminderTitle: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Revision check-in or application deadline"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Time</span>
                  <input
                    value={formState.reminderTime || ''}
                    onChange={(event) => setFormState((current) => ({ ...current, reminderTime: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Today, tomorrow, next week"
                  />
                </label>
                <Button onClick={handleSaveReminder} disabled={!formState.reminderTitle && !formState.reminderTime}>
                  <Save className="h-4 w-4" />
                  Save reminder
                </Button>
              </CardBody>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <Badge tone="sky">Notifications</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Current alerts and prompts</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                {(dashboard.notifications.length + localNotifications.length) > 0 ? (
                  [...dashboard.notifications, ...localNotifications].map((notification) => (
                    <div key={notification.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{notification.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{notification.description}</p>
                        </div>
                        <Badge tone={notification.tone || 'sky'}>New</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <SectionEmptyState
                    title="You are all caught up"
                    description="There are no unread alerts right now."
                    actionLabel="Refresh"
                    onAction={dashboard.refresh}
                  />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Badge tone="emerald">Actions</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Manage the inbox</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button onClick={handleMarkAllSeen}>Mark all as read</Button>
                <Button variant="secondary" onClick={() => setLocalNotifications(dashboard.notifications)}>Restore defaults</Button>
                <Button variant="secondary" onClick={() => navigate('/performance')}>Open performance</Button>
              </CardBody>
            </Card>
          </div>
        );

      case 'reports':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <Badge tone="sky">Reports</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Performance export</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Average score</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{dashboard.stats.averageScore}%</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Best score</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{dashboard.stats.bestScore}%</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Attempts</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{dashboard.stats.attemptCount}</p>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <ProgressBar value={dashboard.stats.progress} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    Download report
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/performance')}>Open performance page</Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Badge tone="amber">Insights</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">What to review next</h2>
              </CardHeader>
              <CardBody className="space-y-3 text-sm leading-7 text-slate-600">
                <p>Use the exported CSV to share your quiz history or archive your learning progress.</p>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Top recommendation</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {dashboard.stats.averageScore >= 80 ? 'Try a harder topic next.' : 'Return to the topic library and review a lesson.'}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <Badge tone="sky">Preferences</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Workspace settings</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-950">Email reminders</p>
                    <p className="text-sm text-slate-600">Keep study prompts visible and actionable.</p>
                  </div>
                  <button type="button" onClick={() => handleToggleSetting('emailReminders')} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                    {dashboard.settings.emailReminders ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-950">Compact view</p>
                    <p className="text-sm text-slate-600">Tighten the dashboard spacing for smaller screens.</p>
                  </div>
                  <button type="button" onClick={() => handleToggleSetting('compactView')} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                    {dashboard.settings.compactView ? 'On' : 'Off'}
                  </button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Badge tone="rose">Session</Badge>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Account actions</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button onClick={handleLogout}>Logout</Button>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
              </CardBody>
            </Card>
          </div>
        );

      default:
        return <SectionEmptyState title="Section unavailable" description="This section is not configured yet." actionLabel="Back to dashboard" onAction={() => navigate('/dashboard')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <Navbar isLoggedIn />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <config.icon className="h-5 w-5" />
                </span>
                <Badge tone="sky">{config.badge}</Badge>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{config.title}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">{config.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="secondary" onClick={dashboard.refresh}>
                <RotateCcw className="h-4 w-4" />
                Refresh data
              </Button>
            </div>
          </div>
          {message ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {message}
              <button type="button" onClick={clearMessage} className="ml-3 font-semibold underline-offset-4 hover:underline">
                Dismiss
              </button>
            </div>
          ) : null}
        </section>

        <section className="mt-6">{renderedContent()}</section>
      </main>
    </div>
  );
}

export default StudentSectionPage;
