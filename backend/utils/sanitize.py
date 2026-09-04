"""Input sanitization for AI tutor prompts."""

import re

# Control characters except tab/newline/carriage return.
_CONTROL_CHARS = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]')


def sanitize_text(value: str | None) -> str:
    """Strip control characters and trim whitespace from user input."""
    if not isinstance(value, str):
        return ''
    return _CONTROL_CHARS.sub('', value).strip()
