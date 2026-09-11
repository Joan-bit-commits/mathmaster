"""Gemini client. Model name and API key come from Django settings (env vars)."""

import io
import json
import logging

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
    response = model.generate_content(
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
    response = model.generate_content(
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
    response = model.generate_content(
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
    response = model.generate_content(
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