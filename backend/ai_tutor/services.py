import hashlib
import json
import logging

from django.core.cache import cache
from google.api_core import exceptions as google_exceptions
from rest_framework import serializers

from analytics.signals_utils import track_event
from utils.gemini import ask_gemini, gemini_configured, stream_gemini
from utils.prompts import math_tutor_prompt
from utils.sanitize import sanitize_text

from .models import ChatMessage, ChatSession

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 60 * 60  # 1 hour
HISTORY_WINDOW = 6

# Errors that mean "this Gemini call itself is broken/misconfigured" —
# these should be loud (logger.critical / alerting) because they won't
# fix themselves on retry.
_CONFIG_ERRORS = (
    google_exceptions.NotFound,  # e.g. bad/deprecated model name
    google_exceptions.InvalidArgument,  # e.g. malformed request/schema
    google_exceptions.PermissionDenied,  # e.g. bad/revoked API key
    google_exceptions.Unauthenticated,
)

# Errors that are transient — Google's side is having a bad moment,
# retrying later is reasonable, no need to page anyone at 3am.
_TRANSIENT_ERRORS = (
    google_exceptions.ResourceExhausted,  # rate limit / quota
    google_exceptions.DeadlineExceeded,  # timeout
    google_exceptions.ServiceUnavailable,
    google_exceptions.InternalServerError,
    google_exceptions.Aborted,
)


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

    Returns (topic, level, session_id, source, cache_hit) — either the
    cached answer string or a 1-tuple containing the prompt.
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


def _error_payload(code: str, message: str):
    return {'error': {'code': code, 'message': message}}


def _classify_gemini_error(exc: Exception):
    """Map a Gemini exception to (log_level, http_status, error_code, user_message).

    Config errors are logged as critical (they need a human to fix the
    model name / key / request shape) but still return a generic 503 to
    the client — no internal exception details leak to the user.
    """
    if isinstance(exc, _CONFIG_ERRORS):
        return (
            'critical',
            503,
            'AI_TUTOR_MISCONFIGURED',
            'AI tutor is temporarily unavailable. Please try again later.',
        )
    if isinstance(exc, _TRANSIENT_ERRORS):
        return (
            'warning',
            503,
            'AI_TUTOR_TEMPORARILY_UNAVAILABLE',
            'AI tutor is busy right now. Please try again shortly.',
        )
    if isinstance(exc, RuntimeError):
        return (
            'error',
            503,
            'SERVICE_UNAVAILABLE',
            'AI tutor is temporarily unavailable. Please try again later.',
        )
    # Unknown/unexpected — treat conservatively as an error worth
    # investigating, but don't assume it's a config problem.
    return (
        'error',
        503,
        'AI_TUTOR_UNAVAILABLE',
        'AI tutor is temporarily unavailable. Please try again later.',
    )


def _log_gemini_error(level: str, exc: Exception, **context):
    log = getattr(logger, level)
    log('Gemini request failed (%s): %s', type(exc).__name__, context, exc_info=True)


def run_ask(request, data):
    """Non-streaming ask. Returns (payload, status_code, cache_hit)."""
    if not gemini_configured():
        return (
            _error_payload('SERVICE_UNAVAILABLE', 'AI tutor is not configured.'),
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
        except Exception as exc:
            level_name, status, code, message = _classify_gemini_error(exc)
            _log_gemini_error(level_name, exc, topic=topic, session_id=session_id)
            return _error_payload(code, message), status, False
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
        yield _sse_error('SERVICE_UNAVAILABLE', 'AI tutor is not configured.')
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
        except Exception as exc:
            level_name, _status, code, message = _classify_gemini_error(exc)
            _log_gemini_error(level_name, exc, topic=topic, session_id=session_id)
            # If we'd already streamed some tokens before failing, don't
            # silently discard them — the client can decide whether a
            # partial answer is worth keeping.
            yield _sse_error(code, message)
            return

    session, _ = _history_for_session(session_id, request.user)
    if session is None:
        session = ChatSession.objects.create(student=request.user, topic=topic)
    _persist_messages(session, question, answer)
    track_event(request.user, 'ai_tutor_ask', metadata={'topic': topic, 'session_id': session.id})

    yield f'event: done\ndata: {json.dumps({"session_id": session.id})}\n\n'


def _sse_error(code: str, message: str) -> str:
    return f'event: error\ndata: {json.dumps({"error": {"code": code, "message": message}})}\n\n'


def _chunk(text: str, size: int = 24):
    for i in range(0, len(text), size):
        yield text[i : i + size]
