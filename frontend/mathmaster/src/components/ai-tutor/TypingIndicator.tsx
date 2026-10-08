/** Three softly pulsing dots shown while the tutor has not produced its first token yet. */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-2 text-sm text-ink-400" role="status" aria-label="The tutor is thinking">
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-400"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </span>
      Thinking…
    </div>
  );
}
