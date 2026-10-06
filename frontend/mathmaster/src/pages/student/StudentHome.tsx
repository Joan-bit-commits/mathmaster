import {
  ArrowRight,
  Camera,
  Flame,
  FileText,
  LockKeyhole,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
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
import {
  TopicsGridSkeleton,
  LoadingSkeleton,
} from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";

export default function StudentHome() {
  const user = useAuthStore((state) => state.user);
  const topicsQuery = useTopics({ page: 1 });
  const summaryQuery = usePerformance("30d");
  const recommendationsQuery = useRecommendations();
  const summary = summaryQuery.data;
  const topics = topicsQuery.data?.results ?? [];
  const firstName = user?.first_name ?? "Learner";
  return (
    <AppShell>
      <PageHeader
        title="Your learning space"
        description="Small steps today lead to big breakthroughs."
      />
      <div className="mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-900 to-ink-800 p-6 shadow-hero sm:p-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div>
            <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hi, {firstName}
            </p>
            <p className="mt-2 text-base text-ink-300">
              Ready to keep your streak alive?
            </p>
            <Link
              to="/performance"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 transition-colors hover:text-white"
            >
              View streak history <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-accent-500 p-1 shadow-glow-brand">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-ink-800 text-2xl font-bold text-white">
                {summary?.level ?? 4}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-400">Current level</p>
              <p className="mt-1 text-xl font-bold text-white">Explorer</p>
              <p className="mt-1 text-xs text-brand-300">
                {summary?.total_xp ?? 2400} XP earned
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          {[
            [
              Flame,
              "Streak",
              `${summary?.current_streak ?? 5} days`,
              "text-orange-300",
            ],
            [
              Target,
              "Mastery",
              `${summary?.mastery ?? 62}%`,
              "text-emerald-300",
            ],
            [Zap, "XP", `${summary?.total_xp ?? 2400}`, "text-yellow-300"],
          ].map(([Icon, label, value, color]) => {
            const C = Icon as React.ElementType;
            return (
              <div
                key={label as string}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <C className={`h-5 w-5 ${color as string}`} />
                <p className="mt-3 text-xs text-ink-400">{label as string}</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {value as string}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      {summaryQuery.isLoading ? (
        <div className="mt-6">
          <LoadingSkeleton variant="hero" />
        </div>
      ) : (
        <Card
          hover
          className="mt-6 flex cursor-pointer flex-col items-center gap-5 p-5 sm:flex-row sm:p-6"
        >
          <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 text-white sm:h-28 sm:w-48">
            <span className="text-5xl font-serif opacity-80">∫</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
              Continue where you left off
            </p>
            <h3 className="mt-2 text-lg font-semibold text-ink-900 dark:text-ink-100">
              Derivatives: The Rate of Change
            </h3>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              Lesson 3 of 5 · 12 minutes remaining
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Progress value={60} className="h-1.5 max-w-[180px]" />
              <span className="text-xs font-bold text-brand-600">60%</span>
            </div>
          </div>
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30">
            <div className="absolute inset-1 rounded-full border-4 border-brand-500/20 border-t-brand-500" />
            <span className="text-sm font-bold text-brand-700 dark:text-brand-300">
              60%
            </span>
          </div>
        </Card>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [
            Sparkles,
            "Ask AI Tutor",
            "Get unstuck step by step",
            "from-brand-500 to-brand-600",
            "/ai-tutor",
          ],
          [
            Camera,
            "Snap & Solve",
            "Photo a problem for solution",
            "from-emerald-500 to-teal-600",
            "/scan",
          ],
          [
            FileText,
            "My Documents",
            "Upload & ask questions",
            "from-accent-500 to-indigo-600",
            "/documents",
          ],
        ].map(([Icon, title, desc, gradient, href]) => {
          const C = Icon as React.ElementType;
          return (
            <Link key={title as string} to={href as string}>
              <motion.div
                whileHover={{ y: -4 }}
                className={`rounded-2xl bg-gradient-to-br ${gradient as string} p-5 text-white shadow-soft transition-shadow hover:shadow-card`}
              >
                <C className="h-7 w-7" />
                <p className="mt-5 text-base font-semibold">
                  {title as string}
                </p>
                <p className="mt-1 text-sm text-white/75">{desc as string}</p>
              </motion.div>
            </Link>
          );
        })}
      </div>
      <Section
        title="Your topics"
        action={{ label: "See all", href: "/topics" }}
      >
        {topicsQuery.isLoading ? (
          <TopicsGridSkeleton />
        ) : topicsQuery.isError ? (
          <ErrorState onRetry={() => void topicsQuery.refetch()} />
        ) : topics.length === 0 ? (
          <Card className="p-8 text-center">
            <LockKeyhole className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">
              Your topics will appear here.
            </p>
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
                key={rec.topic_id}
                to={`/topics/${rec.topic_id}`}
                className="min-w-[260px] rounded-2xl border border-ink-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft dark:border-ink-700 dark:bg-ink-800"
              >
                <Badge tone="brand">Recommended</Badge>
                <h3 className="mt-4 font-semibold text-ink-900 dark:text-ink-100">
                  {rec.topic_name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">
                  {rec.reason}
                </p>
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
