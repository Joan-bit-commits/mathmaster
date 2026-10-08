import * as React from 'react';
import { Check, Copy, Lock, Sparkles } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types/learning';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { GeoGebraSketch } from '@/components/pillar1/GeoGebraSketch';
import { TypingIndicator } from './TypingIndicator';

function RefusalNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50 p-4 dark:border-ink-700 dark:bg-ink-800/60">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">I can only help with mathematics</p>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Try a question about algebra, geometry, trigonometry, calculus, statistics or any other maths topic.
        </p>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable (e.g. insecure context) */
    }
  };
  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-200"
      aria-label="Copy answer"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/**
 * One chat turn. The learner's message is a soft bubble; the tutor's answer is plain text on the page
 * (easier to read for long, step-by-step maths) with a small avatar and a copy action.
 * Memoised so finished messages (and their KaTeX) don't re-render on every streamed token.
 */
export const ChatMessage = React.memo(function ChatMessage({
  message,
  streaming = false,
}: {
  message: ChatMessageType;
  streaming?: boolean;
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-ink-100 px-4 py-2.5 text-[15px] leading-6 text-ink-900 dark:bg-ink-800 dark:text-ink-100">
          {message.content}
        </div>
      </div>
    );
  }

  const empty = message.content === '';
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white" aria-hidden>
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        {empty ? (
          <TypingIndicator />
        ) : message.is_refusal ? (
          <RefusalNotice />
        ) : (
          <>
            <MarkdownRenderer
              content={message.content}
              className="prose-sm max-w-none text-[15px] sm:prose-base prose-p:leading-7 prose-pre:my-3"
            />
            {streaming && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-600 align-middle" aria-hidden />}
            {message.geogebra && <GeoGebraSketch payload={message.geogebra} height={420} />}
          </>
        )}
        {!empty && !streaming && !message.is_refusal && (
          <div className="mt-2 -ml-2">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
    </div>
  );
});
