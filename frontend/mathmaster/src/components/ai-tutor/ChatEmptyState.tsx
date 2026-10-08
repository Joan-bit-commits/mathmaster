import { Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  { title: 'Explain quadratic equations', hint: 'Methods and when to use them' },
  { title: 'Help me solve 2x + 5 = 13', hint: 'Step by step' },
  { title: "What's the Pythagorean theorem?", hint: 'With a worked example' },
  { title: 'Walk me through derivatives', hint: 'From the basics' },
];

/** First-run screen: a greeting and four one-tap starters, like other modern chat apps. */
export function ChatEmptyState({ name, onPick }: { name: string; onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center px-4 py-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white">
        <Sparkles className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
        Hi {name}, what are we solving today?
      </h2>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">Ask anything in maths and I'll walk you through it step by step.</p>
      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onPick(s.title)}
            className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700"
          >
            <span className="block text-sm font-medium text-ink-900 dark:text-ink-100">{s.title}</span>
            <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">{s.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
