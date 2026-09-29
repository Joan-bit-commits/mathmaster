"""Gemini client. Model name and API key come from Django settings (env vars)."""

import io
import json
import logging
import re
import threading
import time
from collections import deque

import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)

_configured = False


def _ensure_configured():
    global _configured
    if not _configured:
        if settings.GENAI_API_KEY:
            genai.configure(api_key=settings.GENAI_API_KEY)
        _configured = True


def gemini_configured() -> bool:
    """True when an API key is present, so the AI tutor is usable."""
    return bool(settings.GENAI_API_KEY)


def _extract_text(response) -> str:
    text = getattr(response, 'text', '') or ''
    if not text and getattr(response, 'parts', None):
        text = ''.join(getattr(part, 'text', '') for part in response.parts)
    return text


# ---------------------------------------------------------------------------
# Rate limiting + 429 handling
#
# Every function below that calls Gemini routes its actual network call
# through _generate_content() rather than calling model.generate_content()
# directly, so the rate limiting and retry behaviour here is consistent
# across text, streaming, and vision calls instead of being duplicated
# (and potentially drifting) four separate times.
# ---------------------------------------------------------------------------

class _RateLimiter:
    """In-process sliding-window limiter: blocks the calling thread until
    there's room within `max_calls` calls per `period_seconds`.

    Coordinates threads WITHIN one Python process — e.g. the concurrent
    per-page OCR calls in curriculum.services.extract_pages_from_pdf all
    share one limiter instance and correctly queue behind each other. It
    does NOT coordinate across separate Celery worker processes: each
    worker process gets its own independent limiter and its own budget,
    so running multiple workers means the real project-wide rate can
    exceed GEMINI_RATE_LIMIT_RPM. Coordinating across processes would need
    a shared store (Redis, which this project already has for Celery) —
    worth doing if you run more than one worker; this is the single-worker
    first pass.
    """

    def __init__(self, max_calls: int, period_seconds: float):
        self.max_calls = max_calls
        self.period_seconds = period_seconds
        self._lock = threading.Lock()
        self._calls = deque()

    def acquire(self):
        while True:
            with self._lock:
                now = time.monotonic()
                while self._calls and now - self._calls[0] >= self.period_seconds:
                    self._calls.popleft()
                if len(self._calls) < self.max_calls:
                    self._calls.append(now)
                    return
                wait = self.period_seconds - (now - self._calls[0])
            time.sleep(max(wait, 0.05))


_rate_limiter = None
_rate_limiter_lock = threading.Lock()


def _get_rate_limiter() -> _RateLimiter:
    global _rate_limiter
    if _rate_limiter is None:
        with _rate_limiter_lock:
            if _rate_limiter is None:
                _rate_limiter = _RateLimiter(max_calls=settings.GEMINI_RATE_LIMIT_RPM, period_seconds=60)
    return _rate_limiter


# Gemini's 429 error bodies include a structured retry_delay (and often a
# human-readable "Please retry in X.Ys" line too) — parse whichever is
# present rather than guessing a backoff, since the server is telling us
# exactly how long the per-minute window has left.
_RETRY_DELAY_PATTERN = re.compile(r'retry_delay\s*\{\s*seconds:\s*(\d+)')
_RETRY_IN_PATTERN = re.compile(r'[Rr]etry in ([\d.]+)s')
# The daily quota (GenerateRequestsPerDay...) resets roughly 24 hours after
# first use, not within the current request — retrying with any backoff
# short of "tomorrow" is pointless, so this is detected separately from an
# ordinary per-minute 429 and fails fast instead of retrying.
_DAILY_QUOTA_MARKER = 'PerDay'

MAX_429_RETRIES = 2
MAX_429_WAIT_SECONDS = 65  # cap a single wait so one call can't block a worker thread indefinitely


def _is_rate_limit_error(exc: Exception) -> bool:
    text = str(exc)
    return '429' in text or ('quota' in text.lower() and 'exceed' in text.lower())


def _is_daily_quota_error(exc: Exception) -> bool:
    return _DAILY_QUOTA_MARKER in str(exc)


def _parse_retry_delay_seconds(exc: Exception) -> float | None:
    text = str(exc)
    match = _RETRY_DELAY_PATTERN.search(text) or _RETRY_IN_PATTERN.search(text)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def _generate_content(model, contents, generation_config, stream: bool = False):
    """The one place that actually calls model.generate_content().

    Applies the shared rate limiter before every attempt, and on a 429:
    a per-minute quota error waits the server-specified delay (capped)
    and retries up to MAX_429_RETRIES times; a per-day quota error fails
    immediately with a clear, distinct message, since no in-request wait
    can fix that — it needs a much longer wait (up to ~24h) or a higher
    tier.
    """
    last_exc = None
    for attempt in range(MAX_429_RETRIES + 1):
        _get_rate_limiter().acquire()
        try:
            return model.generate_content(contents, generation_config=generation_config, stream=stream)
        except Exception as exc:
            if not _is_rate_limit_error(exc):
                raise
            last_exc = exc
            if _is_daily_quota_error(exc):
                raise RuntimeError(
                    "Gemini's daily request quota has been used up for this project. "
                    'This resets roughly 24 hours after the first request of the day — '
                    'try again later, or upgrade to a paid Gemini tier for a much higher limit.'
                ) from exc
            if attempt >= MAX_429_RETRIES:
                break
            delay = _parse_retry_delay_seconds(exc)
            wait = min(delay, MAX_429_WAIT_SECONDS) if delay is not None else min(5 * (2 ** attempt), MAX_429_WAIT_SECONDS)
            logger.warning(
                'Gemini rate limit hit (attempt %d/%d) — waiting %.1fs before retrying.',
                attempt + 1,
                MAX_429_RETRIES,
                wait,
            )
            time.sleep(wait)
    raise RuntimeError('Gemini rate limit exceeded after retrying — please try again shortly.') from last_exc


def ask_gemini(prompt: str, history: list[dict] | None = None, max_output_tokens: int = 2048) -> str:
    """Send prompt (plus optional chat history) to Gemini and return the text.

    history is a list of {"role": "user"|"assistant", "content": str}.
    Raises RuntimeError on failure so callers can convert to a 503.

    max_output_tokens defaults to 2048, which is comfortable for a single
    tutoring answer or a single solved problem, but callers expecting a
    longer structured response (e.g. extracting every question from a
    full exam paper) should pass a higher value — otherwise Gemini's
    response gets cut off mid-output, which for JSON specifically means a
    dangling unterminated string/object rather than a clean error.
    """
    _ensure_configured()
    if not settings.GENAI_API_KEY:
        raise RuntimeError('Gemini API key is not configured.')

    contents = []
    for message in history or []:
        role = 'model' if message.get('role') == 'assistant' else 'user'
        contents.append({'role': role, 'parts': [message.get('content', '')]})
    contents.append({'role': 'user', 'parts': [prompt]})

    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    response = _generate_content(
        model,
        contents,
        generation_config={
            'temperature': 0.3,
            'top_p': 0.9,
            'top_k': 40,
            'max_output_tokens': max_output_tokens,
        },
    )

    text = _extract_text(response)
    if not text:
        raise RuntimeError('Gemini returned an empty response.')
    return text


def stream_gemini(prompt: str, history: list[dict] | None = None):
    """Yield text chunks from Gemini. Raises RuntimeError on failure."""
    _ensure_configured()
    if not settings.GENAI_API_KEY:
        raise RuntimeError('Gemini API key is not configured.')

    contents = []
    for message in history or []:
        role = 'model' if message.get('role') == 'assistant' else 'user'
        contents.append({'role': role, 'parts': [message.get('content', '')]})
    contents.append({'role': 'user', 'parts': [prompt]})

    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    response = _generate_content(
        model,
        contents,
        generation_config={
            'temperature': 0.3,
            'top_p': 0.9,
            'top_k': 40,
            'max_output_tokens': 2048,
        },
        stream=True,
    )
    for chunk in response:
        text = _extract_text(chunk)
        if text:
            yield text


def _call_gemini_vision(image_bytes: bytes, prompt: str) -> dict:
    """Send an image to Gemini and parse its JSON response."""
    from PIL import Image

    _ensure_configured()
    if not settings.GENAI_API_KEY:
        raise RuntimeError('Gemini API key is not configured.')
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    response = _generate_content(
        model,
        [prompt, Image.open(io.BytesIO(image_bytes))],
        generation_config={'temperature': 0.3, 'max_output_tokens': 1024},
    )
    text = _extract_text(response).strip().removeprefix('```json').removesuffix('```').strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {'text': text, 'uneb_code': '', 'topic': ''}


def ask_gemini_vision_text(image_bytes: bytes, prompt: str) -> str:
    """Send an image to Gemini and return the raw transcribed text (no JSON parsing).

    Used for OCR'ing uploaded image *documents* (notes/worksheets photographed
    or scanned as JPEG/PNG), as distinct from `_call_gemini_vision`, which is
    specific to the scan-and-solve flow and expects a JSON reply.
    """
    from PIL import Image

    _ensure_configured()
    if not settings.GENAI_API_KEY:
        raise RuntimeError('Gemini API key is not configured.')
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    response = _generate_content(
        model,
        [prompt, Image.open(io.BytesIO(image_bytes))],
        generation_config={'temperature': 0.2, 'max_output_tokens': 2048},
    )
    text = _extract_text(response)
    if not text:
        raise RuntimeError('Gemini returned an empty response for image OCR.')
    return text


def _repair_stray_backslashes(text: str) -> str:
    """Best-effort repair for the most common way Gemini's JSON breaks:
    math notation (LaTeX-ish `\\in`, `\\mathbb{R}`, `\\frac{}{}`, etc.)
    written with single backslashes inside a JSON string, which isn't
    valid JSON (a backslash must start one of a fixed set of escapes).
    Doubles any backslash that isn't already part of a valid JSON escape
    sequence, so `\\in` becomes `\\\\in` (a literal backslash followed by
    "in") rather than an invalid escape.
    """
    valid_escapes = set('"\\/bfnrtu')
    out = []
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == '\\' and i + 1 < len(text) and text[i + 1] not in valid_escapes:
            out.append('\\\\')
            i += 1
            continue
        out.append(ch)
        i += 1
    return ''.join(out)


def ask_gemini_json(prompt: str, max_output_tokens: int = 2048) -> dict:
    """Ask Gemini for JSON and parse it.

    Gemini's JSON output isn't schema-enforced, and there are two distinct
    common ways it breaks: math notation containing backslashes (handled
    by the repair-and-retry below), and the response simply being cut off
    mid-output because it needed more than max_output_tokens — which for
    JSON means a dangling unterminated string/object near the very end of
    the response, not a backslash problem, and no amount of repair can
    recover truncated content that was never generated. Callers expecting
    a long structured response (many items) should pass a higher
    max_output_tokens rather than relying on the repair step to save them.

    Raises RuntimeError (matching ask_gemini's convention) if the response
    still isn't valid JSON after the repair attempt, rather than silently
    returning {} — a caller treating {} as "Gemini said nothing" can't
    distinguish that from "Gemini's output was garbled", and every
    existing caller was doing exactly that: proceeding with a blank
    result and reporting success to the user instead of surfacing an
    error they could retry.
    """
    text = ask_gemini(prompt, max_output_tokens=max_output_tokens).strip().removeprefix('```json').removesuffix('```').strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        # "Unterminated string" specifically can only happen when the text
        # ends before a string was ever closed — i.e. the response was cut
        # off mid-string. (exc.pos here points to where the string STARTED,
        # not to the end of the text, so a distance-from-end check would
        # misclassify this for anything but a very short trailing string —
        # the error message itself is the reliable signal.) Other error
        # types (bad delimiters, unexpected tokens) mean the text is
        # complete but malformed some other way.
        truncated = 'Unterminated string' in exc.msg
        logger.warning(
            'Failed to parse JSON from Gemini at line %s col %s: %s (%s) | context: %r',
            exc.lineno,
            exc.colno,
            exc.msg,
            'likely truncated by max_output_tokens — response ended before this string closed'
            if truncated
            else 'likely a formatting issue, not truncation',
            text[max(0, exc.pos - 80) : exc.pos + 80],
        )
        try:
            repaired = json.loads(_repair_stray_backslashes(text))
            logger.info('Recovered malformed Gemini JSON via backslash repair.')
            return repaired
        except json.JSONDecodeError as retry_exc:
            logger.warning(
                'Gemini JSON still unparseable after repair attempt (line %s col %s: %s). Full response length=%d',
                retry_exc.lineno,
                retry_exc.colno,
                retry_exc.msg,
                len(text),
            )
            raise RuntimeError('Gemini returned a response that could not be parsed as JSON.') from retry_exc

