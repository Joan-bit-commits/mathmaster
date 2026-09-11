import io
import json
import logging
import mimetypes
import re

import pdfplumber
from django.utils import timezone as django_timezone

from utils.gemini import (
    ask_gemini,
    ask_gemini_json,
    ask_gemini_vision_text,
    gemini_configured,
    stream_gemini,
)
from utils.sanitize import sanitize_text

from .models import Document, DocumentChatSession, DocumentChunk, DocumentQuestion, ScanJob
from .structure import format_curriculum_context

logger = logging.getLogger(__name__)
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

def _is_image_file(document):
    """True when the uploaded document is a photographed/scanned image
    (JPEG/PNG) rather than a PDF, based on the stored filename."""
    content_type, _ = mimetypes.guess_type(document.file.name)
    return bool(content_type) and content_type.startswith('image/')


def _ocr_image_bytes(image_bytes):
    return ask_gemini_vision_text(
        image_bytes,
        'Transcribe all readable text from this image exactly as written, '
        'preserving mathematical notation, equations, and layout as closely '
        'as possible. Return plain text only — no commentary, no markdown.',
    )


def _page_to_png_bytes(page, resolution=150):
    buf = io.BytesIO()
    page.to_image(resolution=resolution).original.save(buf, format='PNG')
    return buf.getvalue()


def extract_pages_from_pdf(file):
    """Return a list of (page_number, text) tuples, 1-indexed.

    Keeping text per-page (instead of joining everything into one blob)
    is what lets chunks carry an accurate page_number, which in turn is
    what lets answer citations ("[Page 12]") actually mean something.

    IMPORTANT: pdfplumber's extract_text() only reads a PDF's text
    LAYER — characters that are actually stored as text. Math exam papers
    converted from Word very often have every formula inserted via an
    equation editor, which embeds each one as a raster IMAGE with no
    underlying text at all. pdfplumber silently skips those: the prose
    around a formula extracts fine, but the formula itself is just gone,
    with nothing left in its place. For a document that's entirely exam
    questions, that can mean every single question loses its actual
    mathematical content while looking like it "worked".

    When Gemini is configured, each page is rendered to an image and
    read via Vision instead (the same OCR path used for photographed
    documents) — this reads the page the way a person would, so embedded
    formula images are captured along with everything else. Only when
    Gemini isn't configured does this fall back to pdfplumber's text
    layer, which is degraded (loses embedded-image formulas) but usable
    for local dev without an API key.
    """
    with pdfplumber.open(file) as pdf:
        if gemini_configured():
            return [(index + 1, _ocr_image_bytes(_page_to_png_bytes(page))) for index, page in enumerate(pdf.pages)]
        return [(index + 1, page.extract_text() or '') for index, page in enumerate(pdf.pages)]


def extract_text_from_image(file):
    """OCR an image document (JPEG/PNG) via Gemini Vision.

    Treated as a single page of text — image documents don't have the
    page-boundary concept a PDF does.
    """
    with file.open('rb') as image_file:
        image_bytes = image_file.read()
    return _ocr_image_bytes(image_bytes)


def extract_pages(document):
    """Dispatch to the right extractor based on the uploaded file type.

    Returns a list of (page_number, text) tuples in both cases, so callers
    (process_document, chunk_pages) don't need to know which path was used.
    """
    if _is_image_file(document):
        return [(1, extract_text_from_image(document.file))]
    return extract_pages_from_pdf(document.file)


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Chunk a single block of text. Does not know about page boundaries —
    kept as-is (and still covered by existing tests) for callers that only
    have a plain string. Use chunk_pages() for page-aware chunking."""
    chunks, current, current_tokens = [], '', 0
    for paragraph in re.split(r'\n\s*\n', text):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        words = paragraph.split()
        if current and current_tokens + len(words) > chunk_size:
            chunks.append(
                {'chunk_index': len(chunks), 'content': current.strip(), 'token_count': current_tokens}
            )
            carry = current.split()[-overlap:]
            current = ' '.join(carry + words)
            current_tokens = len(current.split())
        else:
            current = f'{current}\n\n{paragraph}'.strip()
            current_tokens += len(words)
    if current:
        chunks.append({'chunk_index': len(chunks), 'content': current, 'token_count': current_tokens})
    return chunks


def chunk_pages(pages, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Chunk a list of (page_number, text) tuples, stamping each resulting
    chunk with the real page_number it came from.

    Each page is chunked independently, so overlap does not carry across a
    page boundary — a deliberate trade-off: losing a little context
    continuity at page edges is worth it for citations that are actually
    correct instead of always reading "Page ?".
    """
    all_chunks = []
    for page_number, text in pages:
        if not text or not text.strip():
            continue
        for chunk in chunk_text(text, chunk_size=chunk_size, overlap=overlap):
            all_chunks.append({**chunk, 'page_number': page_number})
    for index, chunk in enumerate(all_chunks):
        chunk['chunk_index'] = index
    return all_chunks


def _detect_level(text, title):
    combined = f'{text[:2000]} {title}'.lower()
    for level in ('s1', 's2', 's3', 's4', 's5', 's6'):
        if level in combined or f'senior {level[1]}' in combined:
            return level.upper()
    return ''


# ---------------------------------------------------------------------------
# Document processing
# ---------------------------------------------------------------------------

def process_document(document):
    try:
        document.processing_status = Document.ProcessingStatus.PROCESSING
        document.processing_error = ''
        document.save(update_fields=['processing_status', 'processing_error', 'updated_at'])

        pages = extract_pages(document)
        text = '\n\n'.join(page_text for _, page_text in pages)

        document.extracted_text = text
        document.page_count = len(pages)
        document.detected_level = _detect_level(text, document.title)
        document.detected_subject = (
            'Mathematics' if re.search(r'algebra|equation|geometry|mathematics', text, re.I) else ''
        )
        document.chunks.all().delete()
        DocumentChunk.objects.bulk_create(
            [DocumentChunk(document=document, **chunk) for chunk in chunk_pages(pages)]
        )
        document.processing_status = Document.ProcessingStatus.READY
        document.save()
        return document
    except Exception as exc:
        logger.exception('Document processing failed: %s', document.id)
        document.processing_status = Document.ProcessingStatus.FAILED
        document.processing_error = str(exc)
        document.save(update_fields=['processing_status', 'processing_error', 'updated_at'])
        raise


def retrieve_relevant_chunks(document, question, top_k=5):
    words = set(sanitize_text(question).lower().split())
    scored = [
        (len(words & set(chunk.content.lower().split())) / max(1, chunk.token_count / 100), chunk)
        for chunk in document.chunks.all()
    ]
    return [chunk for _, chunk in sorted(scored, key=lambda item: item[0], reverse=True)[:top_k]]


def _build_document_prompt(document, question, chunks):
    context = '\n\n---\n\n'.join(
        f'[Page {chunk.page_number or "?"}]\n{chunk.content}' for chunk in chunks
    )
    return (
        f'{format_curriculum_context(level=document.detected_level or "S1")}\n\n'
        f'DOCUMENT EXCERPTS:\n{context}\n\n'
        f'STUDENT QUESTION: {question}\n\n'
        'Answer only from the excerpts and cite page numbers.'
    )


def _resolve_document_session(document, user, session_id, question=''):
    """Continue an existing session the caller points at, or start a new one.

    session_id is untrusted client input, so it's always scoped to the
    document *and* the requesting user — a session_id belonging to someone
    else's document (or someone else's session) is treated as absent rather
    than raising, so a stale/guessed id just starts a fresh conversation
    instead of leaking another user's chat.
    """
    if session_id:
        session = DocumentChatSession.objects.filter(
            id=session_id, document=document, user=user
        ).first()
        if session:
            return session
    return DocumentChatSession.objects.create(
        document=document, user=user, title=(question[:50] or document.title)
    )


def answer_document(document, question, user, session_id=None):
    """Non-streaming document Q&A. Returns (DocumentQuestion, chunks) or
    (None, []) when the document has no matching content."""
    question = sanitize_text(question)
    chunks = retrieve_relevant_chunks(document, question)
    if not chunks:
        return None, []

    session = _resolve_document_session(document, user, session_id, question=question)
    prompt = _build_document_prompt(document, question, chunks)
    answer = (
        ask_gemini(prompt)
        if gemini_configured()
        else 'The AI tutor is not configured. The relevant document excerpts are available for review.'
    )
    record = DocumentQuestion.objects.create(
        document=document, user=user, question=question, answer=answer, session=session
    )
    record.cited_chunks.set(chunks)
    return record, chunks


def answer_document_stream(document, question, user, session_id=None):
    """Streaming document Q&A. Yields SSE-formatted lines.

    Mirrors ai_tutor.services.run_ask_stream's event shape so the client can
    use one SSE-parsing code path for both the tutor and document chat:
    `data: {"token": ...}` frames, an optional `data: {"citation": ...}`
    frame per cited chunk, and a final `event: done` frame carrying the
    session_id.
    """
    question = sanitize_text(question)
    if not question:
        yield _sse_error('EMPTY_QUESTION', 'Please enter a question.')
        return

    chunks = retrieve_relevant_chunks(document, question)
    if not chunks:
        yield _sse_error('NO_CONTENT', 'No relevant content found in this document.')
        return

    session = _resolve_document_session(document, user, session_id, question=question)
    prompt = _build_document_prompt(document, question, chunks)

    if not gemini_configured():
        answer = 'The AI tutor is not configured. The relevant document excerpts are available for review.'
        for token in _chunk(answer):
            yield f'data: {json.dumps({"token": token})}\n\n'
    else:
        try:
            produced = []
            for token in stream_gemini(prompt):
                produced.append(token)
                yield f'data: {json.dumps({"token": token})}\n\n'
            answer = ''.join(produced)
        except Exception as exc:
            logger.exception('Document ask streaming failed: %s', document.id)
            yield _sse_error(
                'AI_TUTOR_UNAVAILABLE', 'AI tutor is temporarily unavailable. Please try again later.'
            )
            return

    record = DocumentQuestion.objects.create(
        document=document, user=user, question=question, answer=answer, session=session
    )
    record.cited_chunks.set(chunks)

    for chunk in chunks:
        yield f'data: {json.dumps({"citation": {"page": chunk.page_number, "chunk_id": chunk.id}})}\n\n'

    yield f'event: done\ndata: {json.dumps({"session_id": session.id})}\n\n'


def _sse_error(code: str, message: str) -> str:
    return f'event: error\ndata: {json.dumps({"error": {"code": code, "message": message}})}\n\n'


def _chunk(text: str, size: int = 24):
    for i in range(0, len(text), size):
        yield text[i : i + size]


# ---------------------------------------------------------------------------
# Scan-and-solve (unchanged)
# ---------------------------------------------------------------------------

def _coerce_text(value, fallback=''):
    """Gemini's JSON output isn't schema-enforced (ask_gemini_json just
    parses whatever text comes back), so a field we expect to be a plain
    string can arrive as a nested object or list instead — e.g. `text`
    coming back as {"en": "...", "note": "..."} rather than a string.
    Rendered directly in the mobile UI, a non-string value here is a hard
    React crash ("Objects are not valid as a React child"), not just a
    display glitch. Coerce anything unexpected into readable text instead
    of ever forwarding it as-is."""
    if isinstance(value, str):
        return value
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, dict):
        for key in ('text', 'description', 'explanation', 'content', 'value'):
            if isinstance(value.get(key), str):
                return value[key]
        return ' '.join(str(v) for v in value.values() if isinstance(v, (str, int, float))) or fallback
    if isinstance(value, list):
        return ' '.join(_coerce_text(item) for item in value) or fallback
    return fallback


def _coerce_mark(value):
    """Same problem as _coerce_text, but for the (optional) mark-scheme
    badge — must end up as a string/number/None, never an object."""
    if value is None:
        return None
    if isinstance(value, (str, int, float)):
        return value
    if isinstance(value, dict):
        for key in ('marks', 'total', 'value', 'mark'):
            if isinstance(value.get(key), (str, int, float)):
                return value[key]
        return None
    return None


def _normalize_solution_steps(raw_steps):
    """Normalize Gemini's `steps` output into a consistent
    [{step, text, mark}, ...] shape, regardless of whether it came back as
    a list of plain strings, a list of dicts with different key names, a
    single string, or something with nested/oddly-typed fields. This is
    the single place that absorbs Gemini's shape variance so every screen
    that renders a solution step can trust the shape unconditionally."""
    if isinstance(raw_steps, str):
        raw_steps = [raw_steps]
    if not isinstance(raw_steps, list):
        return []

    normalized = []
    for index, item in enumerate(raw_steps, start=1):
        if isinstance(item, str):
            normalized.append({'step': index, 'text': item, 'mark': None})
            continue
        if not isinstance(item, dict):
            continue
        text = _coerce_text(
            item.get('text') or item.get('description') or item.get('explanation') or item.get('content'),
            fallback=_coerce_text(item),
        )
        step_number = item.get('step') or item.get('step_number') or item.get('number') or index
        if not isinstance(step_number, (str, int)):
            step_number = index
        normalized.append({'step': step_number, 'text': text, 'mark': _coerce_mark(item.get('mark') or item.get('marks'))})
    return normalized


def solve_scanned_problem(scan):
    if not gemini_configured():
        raise RuntimeError('AI tutor is not configured')
    scan.status = ScanJob.ScanStatus.OCR
    scan.save(update_fields=['status'])
    with scan.image.open('rb') as image_file:
        from utils.gemini import _call_gemini_vision

        extracted = _call_gemini_vision(
            image_file.read(),
            'Transcribe this Ugandan mathematics problem as JSON with keys text, uneb_code, topic.',
        )
    scan.extracted_text = extracted.get('text', '')
    scan.detected_uneb_code = extracted.get('uneb_code', '')
    scan.detected_topic = extracted.get('topic', '')
    scan.status = ScanJob.ScanStatus.SOLVING
    scan.save(update_fields=['status', 'extracted_text', 'detected_uneb_code', 'detected_topic'])
    result = ask_gemini_json(
        f'{format_curriculum_context(code=scan.detected_uneb_code or None)}\nSolve this problem step-by-step and return JSON keys problem_text, steps, final_answer:\n{scan.extracted_text}'
    )
    scan.problem_text = _coerce_text(result.get('problem_text'), fallback=scan.extracted_text)
    scan.solution_steps = _normalize_solution_steps(result.get('steps', []))
    scan.final_answer = _coerce_text(result.get('final_answer'))
    scan.solution_text = '\n'.join(step['text'] for step in scan.solution_steps)
    scan.status = ScanJob.ScanStatus.READY
    scan.completed_at = django_timezone.now()
    scan.save()
    return scan


# ---------------------------------------------------------------------------
# Past paper -> quiz extraction
# ---------------------------------------------------------------------------

def extract_past_paper_questions(document):
    """Pull structured exam questions out of a past paper's extracted text
    using Gemini, instead of treating every non-blank line as a "question"
    (which would include headers, instructions, section titles, and page
    numbers as fake questions — that was the previous behaviour).

    Raises ValueError if the document hasn't finished processing yet, so
    callers can surface a clear "still processing" message rather than
    silently returning an empty list.
    """
    if document.processing_status != Document.ProcessingStatus.READY:
        raise ValueError('This paper has not finished processing yet.')
    if not document.extracted_text.strip():
        return []

    if not gemini_configured():
        # Without AI configured, fall back to naive line splitting rather
        # than failing outright — not great, but usable for local dev.
        return [
            {'question': line.strip(), 'type': 'short-answer', 'marks': 1, 'choices': []}
            for line in document.extracted_text.splitlines()
            if line.strip()
        ][:50]

    prompt = (
        'The following text was extracted from a UNEB mathematics past paper. '
        'Identify only the actual exam QUESTIONS — ignore headers, instructions, '
        'section titles, page numbers, and other formatting artifacts. For each '
        'question, return an object with keys: "question" (the question text), '
        '"type" ("multiple-choice" or "short-answer"), "marks" (integer — your '
        'best estimate from marks shown in the paper, else 1), and "choices" '
        '(list of answer option strings if multiple-choice, else an empty list). '
        'Return ONLY a JSON object with a single key "questions" holding this '
        'list, at most 30 entries.\n\n'
        f'TEXT:\n{document.extracted_text[:12000]}'
    )
    # A full past paper can easily have 15-30 questions once each carries
    # question/type/marks/choices — the default 2048-token budget cuts the
    # response off mid-string well before that (the JSON parse error in
    # that case is "Unterminated string" right at the very end of the
    # response, not a formatting problem the backslash repair can fix).
    result = ask_gemini_json(prompt, max_output_tokens=8192)
    raw_questions = result.get('questions', [])
    if not isinstance(raw_questions, list):
        return []

    normalized = []
    for item in raw_questions[:30]:
        if not isinstance(item, dict):
            continue
        question_text = _coerce_text(item.get('question'))
        if not question_text:
            continue
        marks = item.get('marks')
        try:
            marks = int(marks)
        except (TypeError, ValueError):
            try:
                marks = int(float(marks))
            except (TypeError, ValueError):
                marks = 1
        q_type = item.get('type') if item.get('type') in ('multiple-choice', 'short-answer') else 'short-answer'
        choices = item.get('choices') if isinstance(item.get('choices'), list) else []
        normalized.append(
            {
                'question': question_text,
                'type': q_type,
                'marks': marks,
                'choices': [str(c) for c in choices if isinstance(c, (str, int, float))],
            }
        )
    return normalized