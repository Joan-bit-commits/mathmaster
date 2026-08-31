"""Gemini client. Model name and API key come from Django settings (env vars)."""

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


def ask_gemini(prompt: str, history: list[dict] | None = None) -> str:
    """Send prompt (plus optional chat history) to Gemini and return the text.

    history is a list of {"role": "user"|"assistant", "content": str}.
    Raises RuntimeError on failure so callers can convert to a 503.
    """
    _ensure_configured()
    if not settings.GENAI_API_KEY:
        raise RuntimeError('Gemini API key is not configured.')

    contents = []
    for message in (history or []):
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
    for message in (history or []):
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
