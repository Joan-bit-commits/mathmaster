import * as React from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SYMBOLS = ['²', '√', 'π', '÷', '×', '≤', '≥', '∫', 'Σ'];

/**
 * Message box pinned to the bottom of the chat: auto-growing textarea, Enter to send,
 * Shift+Enter for a new line, and one-tap maths symbols that are awkward to type.
 */
export function ChatComposer({
  onSend,
  busy,
  wide = false,
  autoFocus = false,
}: {
  onSend: (text: string) => void;
  busy: boolean;
  /** Use the wider column (when the conversation list is hidden). */
  wide?: boolean;
  autoFocus?: boolean;
}) {
  const [value, setValue] = React.useState('');
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !busy;

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  React.useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const submit = () => {
    if (!canSend) return;
    onSend(value);
    setValue('');
  };

  const insert = (symbol: string) => {
    const el = ref.current;
    if (!el) return setValue((v) => v + symbol);
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    setValue(value.slice(0, start) + symbol + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  };

  return (
    <div className={cn('mx-auto w-full px-4 pb-4 transition-[max-width] duration-200 sm:px-6', wide ? 'max-w-4xl' : 'max-w-3xl')}>
      <div className="rounded-2xl border border-ink-200 bg-white shadow-soft transition-colors focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10 dark:border-ink-700 dark:bg-ink-800">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Ask a maths question…"
          aria-label="Message the AI tutor"
          className="block max-h-[180px] w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-6 text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-100"
        />
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto scrollbar-thin" role="group" aria-label="Insert a maths symbol">
            {SYMBOLS.map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => insert(symbol)}
                className="h-8 min-w-8 shrink-0 rounded-lg px-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-700 dark:hover:text-ink-100"
                aria-label={`Insert ${symbol}`}
              >
                {symbol}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
              canSend ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-ink-100 text-ink-300 dark:bg-ink-700 dark:text-ink-500',
            )}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-400">
        Enter to send · Shift + Enter for a new line · The tutor only answers mathematics questions
      </p>
    </div>
  );
}
