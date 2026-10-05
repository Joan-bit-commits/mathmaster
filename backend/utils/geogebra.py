"""Parse and validate the [GEOGEBRA_DATA: ...] block the AI tutor emits."""
import json
import logging
import re

logger = logging.getLogger(__name__)

_TAG_RE = re.compile(r'\n\[GEOGEBRA_DATA:\s*(\{.*?\})\s*\]\s*$', re.DOTALL)
_VALID_VIEWS = {'2D', '3D'}
_REQUIRED_FIELDS = {'view', 'title', 'commands'}
_KNOWN_COMMAND_PREFIXES = (
    'f(', 'g(', 'h(', 'p(', 'q(', 'r(', 'a(', 'b(', 'c(', 'A=', 'B=', 'C=',
    'Polygon', 'Circle', 'Line', 'Segment', 'Ray', 'Point', 'Vector', 'Arc',
    'Sphere', 'Plane', 'Surface', 'Cone', 'Cylinder', 'Prism', 'Pyramid', 'Tetrahedron', 'Cube', 'Polyhedron', 'Net',
    'Reflect', 'Rotate', 'Translate', 'Dilate', 'Mirror',
    'Intersect', 'Tangent', 'Normal', 'Derivative', 'Integral', 'Root', 'Extremum',
    'ShowLabel', 'ShowObject', 'SetColor', 'SetLineThickness', 'SetPointSize', 'SetVisible', 'SetConditionToShowObject',
    'Solve', 'Factor', 'Expand', 'Simplify', 'NSolve', 'CSolve', 'Vertex', 'Roots', 'Midpoint', 'Distance', 'Angle',
    'Plane((', 'Sphere((', 'Line((', 'Vector((', 'Point((',
)


def _validate_commands(commands):
    if not isinstance(commands, list) or len(commands) > 50:
        return False
    for cmd in commands:
        if not isinstance(cmd, str) or len(cmd) > 500:
            return False
        cmd = cmd.strip()
        if not any(cmd.startswith(p) for p in _KNOWN_COMMAND_PREFIXES):
            logger.warning('GeoGebra command rejected: %r', cmd[:80])
            return False
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
