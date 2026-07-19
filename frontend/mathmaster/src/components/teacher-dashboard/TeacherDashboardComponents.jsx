import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Copy,
  Eye,
  Menu,
  MoonStar,
  PanelLeftClose,
  PanelLeftOpen,
  PencilLine,
  Search,
  Sparkles,
  SunMedium,
  Target,
  Trash2,
  BrainCircuit,
} from 'lucide-react';
import { Badge, Card, CardBody, CardFooter, CardHeader, ProgressBar } from '../ui';

const motionCardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const chartTooltipStyle = {
  borderRadius: '16px',
  border: '1px solid rgb(226 232 240)',
  background: 'rgba(255,255,255,0.98)',
  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
};

function cnValue(...values) {
  return values.filter(Boolean).join(' ');
}

function AnimatedCounter({ value, duration = 1100, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(value * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [value, duration]);

  const formattedValue = Number.isInteger(value) ? Math.round(count).toLocaleString() : count.toFixed(0);

  return (
    <span>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

export function TeacherProfileCard({ teacher, onToggleTheme, themeMode }) {
  const displayName = teacher?.first_name || teacher?.username || 'Opio';

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Teacher</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{displayName}</h3>
          <p className="mt-1 text-sm text-slate-300">Mathematics Department</p>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white transition hover:bg-white/12"
          aria-label="Toggle dashboard theme"
        >
          {themeMode === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
        <CircleDot className="h-4 w-4 fill-emerald-300 text-emerald-300" />
        Online
      </div>
    </div>
  );
}

export function Sidebar({
  sections,
  activeSection,
  onSelect,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  teacher,
  themeMode,
  onToggleTheme,
}) {
  const sidebarWidthClass = collapsed ? 'w-20 lg:w-20' : 'w-20 lg:w-72';

  const renderNav = (compact = false) => (
    <nav className="mt-5 space-y-1">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={cnValue(
              'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200',
              isActive ? 'bg-white/14 text-white shadow-[0_12px_35px_rgba(14,165,233,0.18)]' : 'text-slate-300 hover:bg-white/10 hover:text-white',
            )}
          >
            <span
              className={cnValue(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all',
                isActive ? 'border-sky-300/30 bg-sky-400/20 text-sky-100' : 'border-white/10 bg-white/7 text-slate-200',
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>

            {!compact && (
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-none">{section.label}</span>
                <span className={cnValue('mt-1 block text-xs', isActive ? 'text-slate-200' : 'text-slate-400')}>
                  {section.description}
                </span>
              </span>
            )}

            {!compact && section.badge ? (
              <span className={cnValue('rounded-full px-2.5 py-1 text-[11px] font-semibold', section.badgeTone)}>
                {section.badge}
              </span>
            ) : null}

            {!compact && isActive ? <ChevronRight className="h-4 w-4 text-sky-200" /> : null}
          </button>
        );
      })}
    </nav>
  );

  const sidebarShell = (
    <div
      className={cnValue(
        'flex h-full flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,_rgba(8,15,32,0.98)_0%,_rgba(11,20,42,0.96)_50%,_rgba(2,6,23,0.99)_100%)] text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]',
        sidebarWidthClass,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4">
        <button type="button" onClick={() => onSelect('overview')} className="flex items-center gap-3 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-sky-500/25">
            MM
          </div>
          {!collapsed && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-sky-200/90">MathMaster</p>
              <h1 className="text-base font-semibold text-white">Teacher Dashboard</h1>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/7 text-white transition hover:bg-white/12 lg:inline-flex"
          aria-label="Collapse sidebar"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/7 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">Navigation</p>
          {!collapsed && <p className="mt-2 text-sm leading-6 text-slate-300">Navigate across the teacher workspace with quick motion and clear hierarchy.</p>}
        </div>

        <div className="mt-4">{renderNav(collapsed)}</div>

        {!collapsed && (
          <div className="mt-5 rounded-[1.5rem] border border-sky-400/15 bg-gradient-to-br from-sky-400/15 via-cyan-400/8 to-transparent p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Teacher cue</p>
              <Sparkles className="h-4 w-4 text-sky-200" />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-200">Keep the curriculum arc visible and switch views without losing context.</p>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <TeacherProfileCard teacher={teacher} onToggleTheme={onToggleTheme} themeMode={themeMode} />
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden md:block">{sidebarShell}</aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              key="backdrop"
              type="button"
              aria-label="Close sidebar"
              className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
              onClick={onCloseMobile}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              key="drawer"
              className="fixed inset-y-0 left-0 z-50 w-80 md:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              {sidebarShell}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function TopNavbar({
  teacher,
  searchQuery,
  onSearchChange,
  onToggleMobileSidebar,
  onToggleTheme,
  themeMode,
  notifications = 0,
}) {
  const displayName = teacher?.first_name || teacher?.username || 'Opio';

  return (
    <div className="sticky top-4 z-30 rounded-[1.75rem] border border-slate-200/80 bg-white/92 px-4 py-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-sky-700 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-500">Good afternoon, {displayName} 👋</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Welcome back to MathMaster.</h2>
            <p className="mt-1 text-sm text-slate-600">Here&apos;s today&apos;s teaching overview.</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 xl:max-w-4xl xl:flex-row xl:items-center xl:justify-end">
          <label className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search topics, lessons, quizzes..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <div className="flex items-center gap-2 self-end xl:self-auto">
            <button
              type="button"
              onClick={onToggleTheme}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
              aria-label="Toggle theme"
            >
              {themeMode === 'dark' ? <SunMedium className="h-4.5 w-4.5" /> : <MoonStar className="h-4.5 w-4.5" />}
            </button>

            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifications > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {notifications}
                </span>
              ) : null}
            </button>

            <Link
              to="/ai-tutor"
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 px-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-sky-500/30"
            >
              AI Tutor
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 xl:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 text-sm font-bold text-white">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">{displayName}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Teacher</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsCards({ stats, onCardClick }) {
  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <motion.button
            key={stat.label}
            type="button"
            onClick={() => onCardClick?.(stat.id)}
            variants={motionCardVariants}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            whileHover={{ y: -4, scale: 1.01 }}
            className={cnValue(
              'group rounded-[1.75rem] border border-slate-200/80 p-5 text-left shadow-[0_18px_55px_-35px_rgba(15,23,42,0.35)] transition-all',
              stat.surface,
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">{stat.label}</p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{stat.description}</p>
              </div>

              <div className={cnValue('flex h-12 w-12 items-center justify-center rounded-2xl', stat.iconSurface)}>
                <Icon className={cnValue('h-5 w-5', stat.iconTone)} />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>{stat.detail}</span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <Sparkles className="h-3.5 w-3.5" />
                Live
              </span>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export function QuickActions({ actions }) {
  return (
    <Card id="assignments" className="overflow-hidden">
      <CardHeader className="border-transparent pb-3">
        <Badge tone="rose">Quick actions</Badge>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">Fast teaching actions</h3>
      </CardHeader>
      <CardBody>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                to={action.to}
                className={cnValue(
                  'group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:bg-white hover:shadow-[0_20px_45px_-30px_rgba(14,165,233,0.45)]',
                  action.surface,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={cnValue('flex h-11 w-11 items-center justify-center rounded-2xl', action.iconSurface)}>
                      <Icon className={cnValue('h-4.5 w-4.5', action.iconTone)} />
                    </div>
                    <p className="mt-4 font-semibold text-slate-950">{action.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

function ChartCard({ title, eyebrow, children, className, footer }) {
  return (
    <Card className={cnValue('overflow-hidden', className)}>
      <CardHeader className="border-transparent pb-3">
        <Badge tone="indigo">{eyebrow}</Badge>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">{title}</h3>
      </CardHeader>
      <CardBody>{children}</CardBody>
      {footer ? <CardFooter className="border-transparent pt-0">{footer}</CardFooter> : null}
    </Card>
  );
}

export function ActivityTimeline({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = item.icon || Activity;

        return (
          <div key={item.title} className="flex gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:bg-sky-50/50">
            <div className={cnValue('flex h-11 w-11 items-center justify-center rounded-2xl', item.iconSurface || 'bg-sky-50 text-sky-700')}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-950">{item.title}</p>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.time}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsSection({ studentProgress, weeklyActivity, quizPerformance, topicCompletion, timeline }) {
  return (
    <div id="analytics" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <ChartCard title="Student Progress Chart" eyebrow="Analytics" className="h-full">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={studentProgress}>
              <defs>
                <linearGradient id="studentProgressFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#2563EB" fill="url(#studentProgressFill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Weekly Lesson Activity" eyebrow="Teaching cadence" className="h-full">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="lessons" radius={[12, 12, 0, 0]} fill="#0EA5E9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Quiz Performance" eyebrow="Assessment" className="h-full">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={quizPerformance}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
              <Radar dataKey="score" fill="#7C3AED" fillOpacity={0.25} stroke="#7C3AED" strokeWidth={2} />
              <Tooltip contentStyle={chartTooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="Topic Completion"
        eyebrow="Curriculum"
        className="h-full"
        footer={<ProgressBar value={topicCompletion.overall} />}
      >
        <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topicCompletion.breakdown}
                  dataKey="value"
                  innerRadius={78}
                  outerRadius={112}
                  paddingAngle={4}
                  animationDuration={800}
                >
                  {topicCompletion.breakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Completion rate</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                <AnimatedCounter value={topicCompletion.overall} suffix="%" />
              </p>
            </div>
            {topicCompletion.breakdown.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-950">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      <Card className="xl:col-span-2">
        <CardHeader className="border-transparent pb-3">
          <Badge tone="sky">Recent activity</Badge>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Activity timeline</h3>
        </CardHeader>
        <CardBody>
          <ActivityTimeline items={timeline} />
        </CardBody>
      </Card>
    </div>
  );
}

export function CurriculumTable({ rows }) {
  return (
    <Card id="topics" className="overflow-hidden">
      <CardHeader className="border-transparent pb-3">
        <Badge tone="emerald">Curriculum</Badge>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">Topic structure and actions</h3>
      </CardHeader>
      <CardBody className="overflow-x-auto p-0">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-400">
              {['Topic', 'Lessons', 'Quizzes', 'Status', 'Students', 'Completion', 'Actions'].map((header) => (
                <th key={header} className="border-b border-slate-200 bg-slate-50 px-6 py-4 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <motion.tr
                key={row.id}
                whileHover={{ y: -2 }}
                className="group border-b border-slate-100 bg-white transition-all duration-200 hover:bg-sky-50/50"
              >
                <td className="px-6 py-5 align-top">
                  <div className="font-semibold text-slate-950">{row.topic}</div>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">{row.description}</p>
                </td>
                <td className="px-6 py-5 align-top text-sm font-semibold text-slate-700">{row.lessons}</td>
                <td className="px-6 py-5 align-top text-sm font-semibold text-slate-700">{row.quizzes}</td>
                <td className="px-6 py-5 align-top">
                  <Badge tone={row.statusTone}>{row.status}</Badge>
                </td>
                <td className="px-6 py-5 align-top text-sm font-semibold text-slate-700">{row.students}</td>
                <td className="px-6 py-5 align-top">
                  <div className="w-40">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{row.completion}%</span>
                      <span>Ready</span>
                    </div>
                    <ProgressBar value={row.completion} />
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex flex-wrap gap-2 opacity-80 transition group-hover:opacity-100">
                    <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700">
                      <PencilLine className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Publish
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-amber-200 hover:text-amber-700">
                      <Copy className="h-3.5 w-3.5" />
                      Duplicate
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

export function CalendarWidget({ events }) {
  const days = useMemo(() => Array.from({ length: 35 }, (_, index) => index + 1), []);

  return (
    <Card id="calendar">
      <CardHeader className="border-transparent pb-3">
        <Badge tone="amber">Calendar</Badge>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">This week</h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {days.map((day) => {
            const isHighlight = [3, 8, 11, 16, 21, 24, 28].includes(day);

            return (
              <div
                key={day}
                className={cnValue(
                  'flex h-11 items-center justify-center rounded-2xl border text-sm font-semibold transition',
                  isHighlight ? 'border-sky-200 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600',
                )}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div className="mt-5 space-y-2">
          {events.map((event) => (
            <div key={event.title} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{event.title}</p>
                <p className="text-xs text-slate-500">{event.time}</p>
              </div>
              <Badge tone={event.tone || 'sky'}>{event.label}</Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function RightSidebar({
  schedule,
  upcomingLessons,
  recentMessages,
  aiSuggestions,
  studentQuestions,
  reminders,
  calendarEvents,
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-transparent pb-3">
          <Badge tone="sky">Today&apos;s Schedule</Badge>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Plan at a glance</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {schedule.map((item) => (
            <div key={item.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
                </div>
                <Badge tone={item.tone}>{item.time}</Badge>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card id="messages">
        <CardHeader className="border-transparent pb-3">
          <Badge tone="rose">Recent Messages</Badge>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Inbox snapshot</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {recentMessages.map((message) => (
            <div key={message.title} className="rounded-[1.25rem] border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:bg-sky-50/40">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  {message.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-950">{message.title}</p>
                    <span className="text-xs text-slate-400">{message.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{message.preview}</p>
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="border-transparent pb-3">
          <Badge tone="indigo">AI Tutor Suggestions</Badge>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Next-best actions</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {aiSuggestions.map((suggestion) => (
            <div key={suggestion.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{suggestion.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{suggestion.description}</p>
                </div>
                <Sparkles className="h-4.5 w-4.5 text-sky-600" />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="border-transparent pb-3">
          <Badge tone="amber">Student Questions</Badge>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Support queue</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {studentQuestions.map((question) => (
            <div key={question.title} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">{question.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{question.description}</p>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="border-transparent pb-3">
          <Badge tone="emerald">Teaching Reminders</Badge>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Stay ahead</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {reminders.map((reminder) => (
            <div key={reminder.title} className="flex items-start gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <Target className="mt-0.5 h-4.5 w-4.5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-slate-950">{reminder.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{reminder.description}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <CalendarWidget events={calendarEvents} />

      <Card id="lessons">
        <CardHeader className="border-transparent pb-3">
          <Badge tone="sky">Upcoming Lessons</Badge>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Next in sequence</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {upcomingLessons.map((lesson) => (
            <div key={lesson.title} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{lesson.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{lesson.topic}</p>
                </div>
                <Badge tone={lesson.tone}>{lesson.time}</Badge>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

export function ResourceCards({ formulaCards, aiTutorCards }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card id="formula-library">
        <CardHeader className="border-transparent pb-3">
          <Badge tone="indigo">Formula Library</Badge>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Quick reference</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {formulaCards.map((item) => (
            <div key={item.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{item.subtitle}</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{item.title}</p>
              <p className="mt-2 font-mono text-sm text-slate-700">{item.formula}</p>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card id="whiteboard">
        <CardHeader className="border-transparent pb-3">
          <Badge tone="sky">Whiteboard</Badge>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Visual thinking space</h3>
        </CardHeader>
        <CardBody>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(239,246,255,1)_100%)] p-5">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.25)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="slate">Geometry</Badge>
                <Badge tone="emerald">Live</Badge>
              </div>
              <div className="flex items-center justify-center rounded-[1.25rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <div className="text-center font-mono text-base text-slate-800">
                  y = mx + b
                  <div className="mt-3 text-3xl text-sky-600">∫</div>
                  <div className="mt-2 text-sm text-slate-500">Sketch, annotate, and explain.</div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card id="ai-tutor">
        <CardHeader className="border-transparent pb-3">
          <Badge tone="rose">AI Tutor</Badge>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Guided teaching assistant</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {aiTutorCards.map((item) => (
            <div key={item.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
                <BrainCircuit className="h-4.5 w-4.5 text-sky-600" />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
