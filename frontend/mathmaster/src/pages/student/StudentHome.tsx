import { useMemo, type ElementType } from "react";
import { ArrowRight, BookCheck, Building2, Camera, ClipboardCheck, Flame, FileText, LockKeyhole, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useSchoolStore } from "@/stores/schoolStore";
import { useRecommendations, usePerformance } from "@/hooks/useAnalytics";
import { useTopics } from "@/hooks/useLearning";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { TopicCard } from "@/components/shared/TopicCard";
import { Section } from "@/components/shared/Section";
import { TopicsGridSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Circular score gauge; shows "—" until there is a real value. */
function ScoreRing({ value }: { value: number | null }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="7" className="stroke-white/10" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          className="stroke-brand-400 transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{value == null ? "—" : `${Math.round(value)}%`}</span>
        <span className="text-[10px] text-ink-400">avg score</span>
      </div>
    </div>
  );
}

export default function StudentHome() {
  const user = useAuthStore((state) => state.user);
  const school = useSchoolStore((state) => state.currentSchool);
  const membership = useSchoolStore((state) => state.currentMembership);
  const topicsQuery = useTopics({ page: 1 });
  const summaryQuery = usePerformance("30d");
  const recommendationsQuery = useRecommendations();

  const summary = summaryQuery.data;
  const topics = useMemo(() => topicsQuery.data?.results ?? [], [topicsQuery.data]);
  const firstName = user?.first_name || user?.username || "Learner";
  const streak = summary?.current_streak ?? 0;
  const statsReady = !summaryQuery.isLoading && !summaryQuery.isError && !!summary;
  const dash = "—";

  // "Continue" = the topic you've started furthest; otherwise the first one you haven't finished.
  const next = useMemo(() => {
    const inProgress = topics
      .filter((t) => t.progress > 0 && t.progress < 100)
      .sort((a, b) => b.progress - a.progress)[0];
    if (inProgress) return { topic: inProgress, started: true };
    const fresh = topics.find((t) => t.progress < 100 && t.lessons_count > 0);
    return fresh ? { topic: fresh, started: false } : null;
  }, [topics]);

  const stats: [ElementType, string, string, string, string][] = [
    [Flame, "Streak", statsReady ? plural(streak, "day") : dash, "Current", "text-orange-300"],
    [BookCheck, "Lessons", statsReady ? String(summary!.lessons_completed) : dash, "Completed · 30 days", "text-emerald-300"],
    [ClipboardCheck, "Quizzes", statsReady ? String(summary!.quizzes_taken) : dash, "Taken · 30 days", "text-sky-300"],
    [Target, "Avg score", statsReady && summary!.avg_score != null ? `${Math.round(summary!.avg_score)}%` : dash, "Last 30 days", "text-yellow-300"],
  ];

  return (
    <AppShell>
      <PageHeader title="Your learning space" description="Small steps today lead to big breakthroughs." />
      <div className="mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-900 to-ink-800 p-6 shadow-hero sm:p-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="min-w-0">
            {school && (
              <p className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-ink-200">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{school.name}{membership ? ` · ${membership.role.charAt(0).toUpperCase()}${membership.role.slice(1)}` : ""}</span>
              </p>
            )}
            <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {greeting()}, {firstName}
            </p>
            <p className="mt-2 text-base text-ink-300">
              {!statsReady
                ? "Loading your progress…"
                : streak > 0
                  ? `You're on a ${plural(streak, "day")} streak — keep it going!`
                  : "Complete a lesson or quiz today to start a streak."}
            </p>
            <Link
              to="/performance"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 transition-colors hover:text-white"
            >
              View full performance <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ScoreRing value={statsReady ? summary!.avg_score : null} />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map(([Icon, label, value, hint, color]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <Icon className={`h-5 w-5 ${color}`} />
              <p className="mt-3 text-xs text-ink-400">{label}</p>
              <p className="mt-1 text-lg font-bold text-white">{value}</p>
              <p className="mt-0.5 text-[10px] text-ink-500">{hint}</p>
            </div>
          ))}
        </div>
        {summaryQuery.isError && (
          <p className="mt-4 text-xs text-rose-300">
            Couldn't load your stats.{" "}
            <button onClick={() => void summaryQuery.refetch()} className="font-semibold underline">Retry</button>
          </p>
        )}
      </div>

      {next && (
        <Link to={`/topics/${next.topic.id}`} className="mt-6 block">
          <Card hover className="flex cursor-pointer flex-col items-center gap-5 p-5 sm:flex-row sm:p-6">
            <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 text-white sm:h-28 sm:w-48">
              <span className="px-3 text-center font-serif text-2xl font-semibold opacity-90 line-clamp-2">{next.topic.subject}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
                {next.started ? "Continue where you left off" : "Start your next topic"}
              </p>
              <h3 className="mt-2 truncate text-lg font-semibold text-ink-900 dark:text-ink-100">{next.topic.name}</h3>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                {next.topic.lessons_completed} of {plural(next.topic.lessons_count, "lesson")} completed · {next.topic.level}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Progress value={next.topic.progress} className="h-1.5 max-w-[180px]" />
                <span className="text-xs font-bold text-brand-600">{next.topic.progress}%</span>
              </div>
            </div>
            <ArrowRight className="hidden h-5 w-5 shrink-0 text-ink-300 sm:block" />
          </Card>
        </Link>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(
          [
            [Sparkles, "Ask AI Tutor", "Get unstuck step by step", "from-brand-500 to-brand-600", "/ai-tutor"],
            [Camera, "Snap & Solve", "Photo a problem for solution", "from-emerald-500 to-teal-600", "/scan"],
            [FileText, "My Documents", "Upload & ask questions", "from-accent-500 to-indigo-600", "/documents"],
          ] as [ElementType, string, string, string, string][]
        ).map(([Icon, title, desc, gradient, href]) => (
          <Link key={title} to={href}>
            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-soft transition-shadow hover:shadow-card`}
            >
              <Icon className="h-7 w-7" />
              <p className="mt-5 text-base font-semibold">{title}</p>
              <p className="mt-1 text-sm text-white/75">{desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      <Section title="Your topics" action={{ label: "See all", href: "/topics" }}>
        {topicsQuery.isLoading ? (
          <TopicsGridSkeleton />
        ) : topicsQuery.isError ? (
          <ErrorState onRetry={() => void topicsQuery.refetch()} />
        ) : topics.length === 0 ? (
          <Card className="p-8 text-center">
            <LockKeyhole className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">Your topics will appear here.</p>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.slice(0, 6).map((topic, index) => (
              <TopicCard key={topic.id} topic={topic} index={index} />
            ))}
          </div>
        )}
      </Section>

      {recommendationsQuery.data && recommendationsQuery.data.length > 0 && (
        <Section title="Recommended for you">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommendationsQuery.data.map((rec) => (
              <Link
                key={`${rec.topic_id}-${rec.topic_name}`}
                to={`/topics/${rec.topic_id}`}
                className="min-w-[260px] max-w-[300px] rounded-2xl border border-ink-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft dark:border-ink-700 dark:bg-ink-800"
              >
                <Badge tone="brand">Recommended</Badge>
                <h3 className="mt-4 font-semibold text-ink-900 dark:text-ink-100">{rec.topic_name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{rec.reason}</p>
                <Button size="sm" variant="secondary" className="mt-5">
                  Start <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </AppShell>
  );
}