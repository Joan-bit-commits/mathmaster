import * as React from 'react';
import { ArrowDown, History, PanelLeftClose, PanelLeftOpen, Plus, Sparkles, X } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { ChatComposer } from '@/components/ai-tutor/ChatComposer';
import { ChatEmptyState } from '@/components/ai-tutor/ChatEmptyState';
import { ChatMessage } from '@/components/ai-tutor/ChatMessage';
import { ConversationList } from '@/components/ai-tutor/ConversationList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const COLLAPSE_KEY = 'mathmaster-tutor-history-collapsed';
const TOPICS = ['General Mathematics', 'Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics'];

export default function AITutor() {
  const user = useAuthStore((s) => s.user);
  const { messages, isStreaming, currentSessionId, sessions, isLoadingSessions, sendMessage, loadSession, removeSession, newChat } = useAIChat();
  const [topic, setTopic] = React.useState(TOPICS[0]);
  const [listOpen, setListOpen] = React.useState(false); // slide-over on small screens
  const [collapsed, setCollapsed] = React.useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
  }); // hidden column on large screens
  const toggleCollapsed = () =>
    setCollapsed((value) => {
      try { localStorage.setItem(COLLAPSE_KEY, value ? '0' : '1'); } catch { /* ignore */ }
      return !value;
    });
  const [atBottom, setAtBottom] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;
  const lastMessage = messages[messages.length - 1];

  const scrollToBottom = React.useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Follow the answer as it streams, unless the learner has scrolled up to read earlier steps.
  React.useEffect(() => {
    if (atBottom || lastMessage?.role === 'user') scrollToBottom();
  }, [messages, atBottom, lastMessage?.role, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const send = (text: string) => {
    setAtBottom(true);
    void sendMessage(text, topic, undefined);
  };

  const openSession = (id: string) => {
    void loadSession(id);
    setListOpen(false);
  };

  const startNew = () => {
    newChat();
    setListOpen(false);
  };

  return (
    <AppShell>
      <div className="relative flex h-[calc(100dvh-6rem)] min-h-[480px] overflow-hidden rounded-2xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900 sm:h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-8rem)]">
        {/* Conversations: a fixed column on desktop, a slide-over on small screens. */}
        {listOpen && <div className="absolute inset-0 z-20 bg-ink-900/30 lg:hidden" onClick={() => setListOpen(false)} aria-hidden />}
        <aside
          className={cn(
            'absolute inset-y-0 left-0 z-30 w-72 border-r border-ink-200 bg-white transition-transform dark:border-ink-700 dark:bg-ink-900',
            'lg:static lg:z-auto lg:shrink-0 lg:translate-x-0 lg:overflow-hidden lg:bg-ink-50/60 lg:transition-[width,visibility] lg:duration-200 dark:lg:bg-ink-900',
            listOpen ? 'translate-x-0' : '-translate-x-full',
            collapsed ? 'lg:invisible lg:w-0 lg:border-r-0' : 'lg:visible lg:w-72',
          )}
          aria-label="Conversations"
          aria-hidden={collapsed ? true : undefined}
        >
          {/* Fixed-width inner box so the list doesn't reflow while the column animates. */}
          <div className="relative h-full w-72">
            <button type="button" onClick={() => setListOpen(false)} className="absolute right-2 top-2 z-10 rounded-lg p-2 text-ink-400 hover:bg-ink-100 lg:hidden dark:hover:bg-ink-800" aria-label="Close conversations">
              <X className="h-4 w-4" />
            </button>
            <ConversationList sessions={sessions} activeId={currentSessionId} loading={isLoadingSessions} onSelect={openSession} onDelete={(id) => void removeSession(id)} onNew={startNew} />
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col" aria-label="Chat with the AI tutor">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-100 px-3 py-2.5 dark:border-ink-800 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" onClick={() => setListOpen(true)} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 lg:hidden dark:hover:bg-ink-800" aria-label="Open conversations">
                <History className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden rounded-lg p-2 text-ink-500 hover:bg-ink-100 lg:inline-flex dark:hover:bg-ink-800"
                aria-label={collapsed ? 'Show conversations' : 'Hide conversations'}
                aria-expanded={!collapsed}
                title={collapsed ? 'Show conversations' : 'Hide conversations'}
              >
                {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </button>
              <h1 className="flex items-center gap-2 text-base font-semibold text-ink-900 dark:text-white">
                <Sparkles className="h-4 w-4 text-brand-600" aria-hidden /> AI Tutor
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="h-9 w-auto min-w-[9rem] max-w-[60vw] gap-2 whitespace-nowrap text-sm" aria-label="Topic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-max max-w-[90vw]" align="end">
                  {TOPICS.map((t) => <SelectItem key={t} value={t} className="whitespace-nowrap">{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <button type="button" onClick={startNew} className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 sm:inline-flex dark:text-ink-300 dark:hover:bg-ink-800">
                <Plus className="h-4 w-4" /> New chat
              </button>
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto scrollbar-thin" role="log" aria-live="polite" aria-relevant="additions">
              {hasMessages ? (
                <div className={cn('mx-auto w-full space-y-7 px-4 py-6 transition-[max-width] duration-200 sm:px-6', collapsed ? 'max-w-4xl' : 'max-w-3xl')}>
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} streaming={isStreaming && message === lastMessage} />
                  ))}
                </div>
              ) : (
                <ChatEmptyState name={user?.first_name || user?.username || 'there'} onPick={send} />
              )}
            </div>
            {hasMessages && !atBottom && (
              <button
                type="button"
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-3 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 shadow-card hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
                aria-label="Scroll to latest message"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            )}
          </div>

          <ChatComposer onSend={send} busy={isStreaming} wide={collapsed} autoFocus />
        </section>
      </div>
    </AppShell>
  );
}
