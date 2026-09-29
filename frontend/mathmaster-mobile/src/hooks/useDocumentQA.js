import { useState } from 'react';

import { askDocumentStream, fetchDocumentSession, fetchDocumentSessions } from '../services/documents';

export default function useDocumentQA(documentId) {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setStreaming] = useState(false);
  const [currentAnswer, setAnswer] = useState('');
  // Citations for the message currently streaming in. Once that message
  // finishes, its citations move onto the message object itself
  // (message.citations) so each answer keeps the citations that actually
  // support it, instead of one flat list shared across the whole
  // conversation.
  const [currentCitations, setCurrentCitations] = useState([]);
  const [loadingSession, setLoadingSession] = useState(false);
  const [error, setError] = useState(null);

  const sendQuestion = async (question) => {
    setStreaming(true);
    setAnswer('');
    setCurrentCitations([]);
    setError(null);
    setMessages((items) => [...items, { role: 'user', content: question }]);
    try {
      let answer = '';
      let citations = [];
      await askDocumentStream(documentId, question, currentSession?.id, {
        onToken: (token) => {
          answer += token;
          setAnswer(answer);
        },
        onCitation: (citation) => {
          citations = [...citations, citation];
          setCurrentCitations(citations);
        },
        onDone: (data) => {
          const session = { id: data.session_id };
          setCurrentSession(session);
          setSessions((items) =>
            items.some((item) => item.id === session.id) ? items : [...items, { id: session.id, title: question }]
          );
        },
      });
      setMessages((items) => [...items, { role: 'assistant', content: answer, citations }]);
      setAnswer('');
      setCurrentCitations([]);
    } catch (err) {
      setError(err);
    } finally {
      setStreaming(false);
    }
  };

  const loadSessions = async () => {
    try {
      setSessions(await fetchDocumentSessions(documentId));
    } catch (err) {
      setError(err);
    }
  };

  /**
   * Loads a past session's full Q&A history as the active conversation.
   * Each stored question/answer pair becomes a user + assistant message,
   * with citations carried over from that answer's cited_chunks — so a
   * reopened past answer shows the same tappable citations a freshly
   * streamed one would, instead of losing them.
   */
  const selectSession = async (session) => {
    setLoadingSession(true);
    setError(null);
    try {
      const detail = await fetchDocumentSession(documentId, session.id);
      const history = (detail.messages || []).flatMap((item) => [
        { role: 'user', content: item.question },
        {
          role: 'assistant',
          content: item.answer,
          citations: (item.cited_chunks || []).map((chunk) => ({
            page: chunk.page_number,
            chunk_id: chunk.id,
          })),
        },
      ]);
      setMessages(history);
      setCurrentSession({ id: detail.id });
    } catch (err) {
      setError(err);
    } finally {
      setLoadingSession(false);
    }
  };

  const startNewConversation = () => {
    setCurrentSession(null);
    setMessages([]);
    setAnswer('');
    setCurrentCitations([]);
  };

  return {
    sessions,
    currentSession,
    messages,
    sendQuestion,
    loadSessions,
    selectSession,
    startNewConversation,
    loadingSession,
    isStreaming,
    currentAnswer,
    currentCitations,
    error,
  };
}
