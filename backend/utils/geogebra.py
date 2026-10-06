"""Parse and validate the [GEOGEBRA_DATA: ...] block the AI tutor emits."""
import json
import logging
import re

logger = logging.getLogger(__name__)

_TAG_RE = re.compile(r'\n\[GEOGEBRA_DATA:\s*(\{.*?\})\s*\]\s*$', re.DOTALL)
_VALID_VIEWS = {'2D', '3D'}
_REQUIRED_FIELDS = {'view', 'title', 'commands'}


_DANGEROUS_COMMAND_PATTERNS = (
    'javascript', 'eval(', 'exec(', 'system(', 'python', '<script',
    'fetch(', 'xmlhttprequest', 'import(', 'require(', 'process.',
    'function(', '=>', 'this.', 'window.', 'document.', 'globalthis',
)


def _validate_commands(commands):
    """GeoGebra's evalCommand is a sandboxed command interpreter (its own
    syntax — it cannot execute JavaScript), so a whitelist of command names
    rejects perfectly valid sketches whenever Gemini uses a command we didn't
    anticipate (Text, Slope, Midpoint with spaces...). Instead: block
    actually dangerous patterns and cap size/count."""
    if not isinstance(commands, list) or len(commands) > 50:
        return False
    cleaned = []
    for cmd in commands:
        if not isinstance(cmd, str):
            return False
        cmd = cmd.strip()
        if not cmd or len(cmd) > 500:
            return False
        lowered = re.sub(r'\s+', '', cmd).lower()
        if any(pattern in lowered for pattern in _DANGEROUS_COMMAND_PATTERNS):
            logger.warning('GeoGebra command rejected: %r', cmd[:80])
            return False
        cleaned.append(cmd)
    # Persist the cleaned list so the client re-runs exactly what passed.
    commands[:] = cleaned
    return True


def extract_geogebra(answer: str) -> tuple[str, dict | None]:
    if not answer:
        return answer, None
    match = _TAG_RE.search(answer)
    if not match:
        return answer, None
    raw_json = match.group(1)
    cleaned = answer[: match.start()].rstrip()
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        logger.warning('GeoGebra JSON parse failed: %s', exc)
        return cleaned, None
    if not isinstance(data, dict):
        return cleaned, None
    view = data.get('view')
    if view not in _VALID_VIEWS:
        return cleaned, None
    if _REQUIRED_FIELDS - data.keys():
        return cleaned, None
    if not _validate_commands(data.get('commands', [])):
        return cleaned, None
    if view == '2D':
        for k in ('x_min', 'x_max', 'y_min', 'y_max'):
            if k in data and not isinstance(data[k], (int, float)):
                data.pop(k, None)
        for k in ('axes', 'grid'):
            if k in data and not isinstance(data[k], bool):
                data[k] = bool(data[k])
    return cleaned, data
