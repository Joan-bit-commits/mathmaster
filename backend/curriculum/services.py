import logging
import re

import pdfplumber
from django.utils import timezone as django_timezone

from utils.gemini import ask_gemini, ask_gemini_json, gemini_configured
from utils.sanitize import sanitize_text

from .models import Document, DocumentChatSession, DocumentChunk, DocumentQuestion, ScanJob
from .structure import format_curriculum_context

logger = logging.getLogger(__name__)
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        return '\n\n'.join(page.extract_text() or '' for page in pdf.pages), len(pdf.pages)


def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
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


def _detect_level(text, title):
    combined = f'{text[:2000]} {title}'.lower()
    for level in ('s1', 's2', 's3', 's4', 's5', 's6'):
        if level in combined or f'senior {level[1]}' in combined:
            return level.upper()
    return ''


def process_document(document):
    try:
        document.processing_status = Document.ProcessingStatus.PROCESSING
        document.processing_error = ''
        document.save(update_fields=['processing_status', 'processing_error', 'updated_at'])
        text, page_count = extract_text_from_pdf(document.file)
        document.extracted_text = text
        document.page_count = page_count
        document.detected_level = _detect_level(text, document.title)
        document.detected_subject = (
            'Mathematics' if re.search(r'algebra|equation|geometry|mathematics', text, re.I) else ''
        )
        document.chunks.all().delete()
        DocumentChunk.objects.bulk_create(
            [DocumentChunk(document=document, **chunk) for chunk in chunk_text(text)]
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


def answer_document(document, question, user, session=None):
    chunks = retrieve_relevant_chunks(document, question)
    if not chunks:
        return None, []
    context = '\n\n---\n\n'.join(f'[Page {chunk.page_number or "?"}]\n{chunk.content}' for chunk in chunks)
    prompt = f'{format_curriculum_context(level=document.detected_level or "S1")}\n\nDOCUMENT EXCERPTS:\n{context}\n\nSTUDENT QUESTION: {sanitize_text(question)}\n\nAnswer only from the excerpts and cite page numbers.'
    answer = (
        ask_gemini(prompt)
        if gemini_configured()
        else 'The AI tutor is not configured. The relevant document excerpts are available for review.'
    )
    session = session or DocumentChatSession.objects.create(document=document, user=user, title=question[:50])
    record = DocumentQuestion.objects.create(
        document=document, user=user, question=question, answer=answer, session=session
    )
    record.cited_chunks.set(chunks)
    return record, chunks


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
    scan.problem_text = result.get('problem_text', scan.extracted_text)
    scan.solution_steps = result.get('steps', [])
    scan.final_answer = result.get('final_answer', '')
    scan.solution_text = '\n'.join(step.get('text', '') for step in scan.solution_steps)
    scan.status = ScanJob.ScanStatus.READY
    scan.completed_at = django_timezone.now()
    scan.save()
    return scan
