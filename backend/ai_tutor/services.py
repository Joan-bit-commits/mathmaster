import hashlib
import json
import logging

from django.core.cache import cache
from rest_framework import serializers

from analytics.signals_utils import track_event
from utils.gemini import ask_gemini, gemini_configured, stream_gemini
from utils.prompts import math_tutor_prompt
from utils.sanitize import sanitize_text

from .models import ChatMessage, ChatSession

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 60 * 60  # 1 hour
HISTORY_WINDOW = 6


class AITutorRequestSerializer(serializers.Serializer):
    topic = serializers.CharField(max_length=200)
    question = serializers.CharField(max_length=2000)
    level = serializers.CharField(max_length=50, required=False, allow_blank=True)
    context = serializers.CharField(max_length=4000, required=False, allow_blank=True)
    session_id = serializers.IntegerField(required=False)


def _cache_key(topic: str, question: str, level: str) -> str:
    raw = f'{topic}|{question}|{level}'
    digest = hashlib.sha256(raw.encode('utf-8')).hexdigest()
    return f'ai-tutor:{digest}'


def _history_for_session(session_id: int | None, student):
    if not session_id:
        return None, []
    session = ChatSession.objects.filter(id=session_id, student=student).first()
    if not session:
        return None, []
    messages = list(session.messages.all())[-HISTORY_WINDOW:]
    history = [{'role': m.role, 'content': m.content} for m in messages]
    return session, history


def _persist_messages(session, question: str, answer: str):
    ChatMessage.objects.create(session=session, role='user', content=question)
    ChatMessage.objects.create(session=session, role='assistant', content=answer)


def _get_answer(request, data):
    """Shared logic for streaming and non-streaming views.

    Returns (response_payload_iterator, status, session_id) — either the
    cached answer string or a generator of chunks.
    """
    topic = sanitize_text(data['topic'])
    question = sanitize_text(data['question'])
    level = sanitize_text(data.get('level') or getattr(request.user, 'role', '') or '')
    context = sanitize_text(data.get('context') or '')
    session_id = data.get('session_id')

    prompt = math_tutor_prompt(topic=topic, question=question, level=level, context=context)

    key = _cache_key(topic, question, level)
    cached = cache.get(key)
    if cached:
        return topic, level, session_id, cached, True

    return topic, level, session_id, (prompt,), False


def run_ask(request, data):
    """Non-streaming ask. Returns (payload, status_code, cache_hit)."""
    if not gemini_configured():
        return (
            {'error': {'code': 'SERVICE_UNAVAILABLE', 'message': 'AI tutor is not configured.'}},
            503,
            False,
        )

    topic, level, session_id, source, cache_hit = _get_answer(request, data)
    question = sanitize_text(data['question'])
    if cache_hit:
        answer = source
    else:
        session, history = _history_for_session(session_id, request.user)
        try:
            answer = ask_gemini(source[0], history=history)
        except Exception:
            logger.exception('Gemini request failed')
            return (
                {
                    'error': {
                        'code': 'SERVICE_UNAVAILABLE',
                        'message': 'AI tutor is temporarily unavailable. Please try again later.',
                    }
                },
                503,
                False,
            )
        cache.set(_cache_key(topic, question, level), answer, CACHE_TTL_SECONDS)

    session, _ = _history_for_session(session_id, request.user)
    if session is None:
        session = ChatSession.objects.create(student=request.user, topic=topic)
    _persist_messages(session, question, answer)
    track_event(request.user, 'ai_tutor_ask', metadata={'topic': topic, 'session_id': session.id})

    return (
        {
            'session_id': session.id,
            'topic': topic,
            'level': level,
            'answer': answer,
            'cached': cache_hit,
        },
        200,
        cache_hit,
    )


def run_ask_stream(request, data):
    """Streaming ask. Yields SSE-formatted lines. Caller must return StreamingHttpResponse."""
    if not gemini_configured():
        yield 'event: error\ndata: {"error": "AI tutor is not configured."}\n\n'
        return

    topic = sanitize_text(data['topic'])
    question = sanitize_text(data['question'])
    level = sanitize_text(data.get('level') or getattr(request.user, 'role', '') or '')
    context = sanitize_text(data.get('context') or '')
    session_id = data.get('session_id')

    key = _cache_key(topic, question, level)
    cached = cache.get(key)

    if cached:
        answer = cached
        for token in _chunk(answer):
            yield f'data: {json.dumps({"token": token})}\n\n'
    else:
        session, history = _history_for_session(session_id, request.user)
        prompt = math_tutor_prompt(topic=topic, question=question, level=level, context=context)
        try:
            chunks = []
            for token in stream_gemini(prompt, history=history):
                chunks.append(token)
                yield f'data: {json.dumps({"token": token})}\n\n'
            answer = ''.join(chunks)
            cache.set(key, answer, CACHE_TTL_SECONDS)
        except Exception:
            logger.exception('Gemini streaming failed')
            yield 'event: error\ndata: {"error": "AI tutor is temporarily unavailable."}\n\n'
            return

    session, _ = _history_for_session(session_id, request.user)
    if session is None:
        session = ChatSession.objects.create(student=request.user, topic=topic)
    _persist_messages(session, question, answer)
    track_event(request.user, 'ai_tutor_ask', metadata={'topic': topic, 'session_id': session.id})

    yield f'event: done\ndata: {json.dumps({"session_id": session.id})}\n\n'


def _chunk(text: str, size: int = 24):
    for i in range(0, len(text), size):
        yield text[i : i + size]
