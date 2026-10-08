import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Trash2, Send, History, MessageSquare, ChevronRight } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { QuickPromptChips } from '@/components/pillar1/QuickPromptChips';
import { CitationChip } from '@/components/pillar1/CitationChip';
import { DocumentViewer } from '@/components/pillar1/DocumentViewer';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { fetchDocument, deleteDocument, fetchDocumentSessions, fetchDocumentSession, askDocumentStream } from '@/services/documents';
import { mockDocuments } from '@/mocks/pillar1Mocks';
import { parseApiError } from '@/lib/api';
import { cn, formatRelativeTime } from '@/lib/utils';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const quickPrompts = ['Summarize this document', 'Key formulas', 'Quiz me', 'Explain the main chapter'];

type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string; citations?: { chunk_id: string; page_number: number; snippet: string; score: number }[] };

function ThinkingDots() {
  return <div className="flex items-center gap-1.5 py-2">{[0, 1, 2].map((i) => <motion.span key={i} animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} className="h-2 w-2 rounded-full bg-ink-400" />)}</div>;
}

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = React.useState<'read' | 'ask' | 'sessions'>('ask');
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [loadingSession, setLoadingSession] = React.useState(false);
  const [readPage, setReadPage] = React.useState(1);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { data: doc, isLoading, isError, refetch } = useQuery({
    queryKey: ['document', id],
    queryFn: () => (USE_MOCKS ? Promise.resolve(mockDocuments[0]) : fetchDocument(id!)),
    enabled: !!id,
  });

  const { data: sessions } = useQuery({
    queryKey: ['document-sessions', id],
    queryFn: () => (USE_MOCKS ? Promise.resolve([]) : fetchDocumentSessions(id!)),
    enabled: !!id && mode === 'sessions',
  });

  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;
    const userMsg: ChatMsg = { id: `msg-${Date.now()}`, role: 'user', content: trimmed };
    const assistantId = `msg-assistant-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }]);
    setInput('');
    setIsStreaming(true);
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 800));
      setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: 'This is a mock response. Connect a backend to get real cited answers.' } : m));
      setIsStreaming(false);
      return;
    }
    await askDocumentStream(id!, trimmed, sessionId, {
      onToken: (token) => setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: m.content + token } : m)),
      onDone: (_full, sid) => { setSessionId(sid); setIsStreaming(false); void queryClient.invalidateQueries({ queryKey: ['document-sessions', id] }); },
      onError: (err) => { setIsStreaming(false); setMessages((prev) => prev.filter((m) => m.id !== assistantId)); toast.error(err.message); },
    });
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      if (!USE_MOCKS) await deleteDocument(id);
      toast.success('Document deleted');
      navigate('/documents');
    } catch (err) { toast.error(parseApiError(err)); }
  };

  // Open a past session: load its messages into the Ask tab so the user can
  // read (and continue) the earlier conversation.
  const handleOpenSession = async (sid: string) => {
    if (USE_MOCKS || !id) { setMode('ask'); return; }
    setLoadingSession(true);
    try {
      const detail = await fetchDocumentSession(id, sid);
      setSessionId(sid);
      setMessages(
        (detail.messages || []).map((m) => ({
          id: String(m.id),
          role: m.role,
          content: m.content,
          citations: m.citations ?? undefined,
        })),
      );
      setMode('ask');
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setLoadingSession(false);
    }
  };

  if (isLoading) return <AppShell><div className="mt-6"><LoadingSkeleton variant="hero" /></div></AppShell>;
  if (isError || !doc) return <AppShell><ErrorState onRetry={() => void refetch()} message="Could not load this document." /></AppShell>;

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/documents')}><ArrowLeft className="h-4 w-4" /> Back to documents</Button>
        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-danger hover:text-danger"><Trash2 className="h-4 w-4" /> Delete</Button>
      </div>

      <Card className="mt-4 flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400"><FileText className="h-6 w-6" /></div>
        <div className="min-w-0 flex-1"><h1 className="truncate text-lg font-bold text-ink-900 dark:text-white">{doc.title}</h1><p className="mt-0.5 text-xs text-ink-400">{doc.page_count} pages · <Badge tone={doc.processing_status === 'ready' ? 'success' : 'warning'} className="capitalize">{doc.processing_status}</Badge></p></div>
      </Card>

      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="mt-6">
        <TabsList>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="ask">Ask</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="read">
          <Card className="p-3">
            {USE_MOCKS ? (
              <p className="p-6 text-center text-sm text-ink-400">PDF preview is unavailable in mock mode.</p>
            ) : (
              <DocumentViewer documentId={String(doc.id)} fileType={doc.file_type} page={readPage} title={doc.title} />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="ask">
          <div className="space-y-4">
            {messages.length === 0 && <QuickPromptChips prompts={quickPrompts} onSelect={(p) => void handleSend(p)} />}
            <div ref={scrollRef} className="max-h-[calc(100vh-360px)] min-h-[200px] space-y-3 overflow-y-auto scrollbar-thin">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">M</div>}
                  <div className={cn('max-w-2xl', msg.role === 'user' ? 'rounded-2xl rounded-br-md bg-brand-500 px-4 py-2.5 text-sm text-white' : 'rounded-2xl rounded-bl-md border border-ink-200 bg-white px-4 py-2.5 dark:border-ink-700 dark:bg-ink-800')}>
                    {msg.role === 'user' ? <p className="text-sm">{msg.content}</p> : msg.content === '' ? <ThinkingDots /> : <div><MarkdownRenderer content={msg.content} className="prose-sm" />{msg.citations && msg.citations.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{msg.citations.map((c, i) => <CitationChip key={i} citation={c} onOpen={(page) => { setReadPage(page || 1); setMode('read'); }} />)}</div>}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-end gap-2 rounded-2xl border border-ink-200 bg-white/80 p-2 backdrop-blur-xl dark:border-ink-700 dark:bg-ink-800/80">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(input); } }} rows={1} placeholder="Ask a question about this document..." className="max-h-[100px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none dark:text-ink-100" />
              <button onClick={() => void handleSend(input)} disabled={!input.trim() || isStreaming} className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition-all', input.trim() && !isStreaming ? 'bg-brand-500 text-white hover:bg-brand-600' : 'bg-ink-100 text-ink-300 dark:bg-ink-700')}><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="space-y-3">
            {(loadingSession) ? (
              <Card className="p-8 text-center"><p className="text-sm text-ink-500">Loading conversation…</p></Card>
            ) : (sessions ?? []).length === 0 ? (
              <Card className="p-8 text-center"><History className="mx-auto h-8 w-8 text-ink-300" /><p className="mt-3 text-sm text-ink-500">No past sessions for this document.</p></Card>
            ) : (
              (sessions ?? []).map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card hover className="flex items-center gap-4 p-4">
                    <button onClick={() => void handleOpenSession(s.id)} className="flex min-w-0 flex-1 items-center gap-4 text-left" aria-label={`Open conversation: ${s.question}`}>
                      <MessageSquare className="h-5 w-5 shrink-0 text-ink-400" />
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{s.question}</p><p className="mt-0.5 text-xs text-ink-400">{formatRelativeTime(s.created_at)} · {s.message_count} messages</p></div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
                    </button>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}