import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2, default_retry_delay=10)
def process_document_task(self, document_id):
    """Background wrapper around process_document() — phase 1 (fast,
    text-layer-only for a PDF). process_document() already records
    FAILED + processing_error on the document itself before re-raising,
    so this doesn't need special error handling beyond a retry for
    transient failures (a momentary hiccup, a dropped connection) — a
    genuine, permanent failure (corrupt PDF, unsupported content) will
    just fail the same way on retry and stay recorded as FAILED, which
    is exactly what should happen.

    With CELERY_TASK_ALWAYS_EAGER=True (the default — see config/settings.py),
    calling process_document_task.delay(document.id) runs this synchronously
    in-process, in place, with no behavior change from calling
    process_document() directly. It only actually runs in the background
    once a real worker is running and CELERY_TASK_ALWAYS_EAGER=false.

    Once phase 1 succeeds, this dispatches phase 2 — the slower Vision
    OCR upgrade — as its own separate task, so phase 1's success (and the
    document becoming usable) is never delayed by how long Vision OCR
    ends up taking or whether it succeeds at all.
    """
    from .models import Document
    from .services import _is_image_file, gemini_configured, process_document

    try:
        document = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        logger.warning('process_document_task: document %s no longer exists', document_id)
        return

    try:
        process_document(document)
    except Exception as exc:
        logger.exception('process_document_task failed for document %s', document_id)
        raise self.retry(exc=exc)

    # Image documents already got their one (Vision) pass inside phase 1
    # above — nothing to upgrade. A PDF, when Gemini is configured, gets
    # queued for the richer Vision OCR pass now that it's already usable.
    if gemini_configured() and not _is_image_file(document):
        upgrade_document_vision_ocr_task.delay(document_id)


@shared_task
def upgrade_document_vision_ocr_task(document_id):
    """Background wrapper around upgrade_document_with_vision_ocr() —
    phase 2. Not wrapped in a retry: upgrade_document_with_vision_ocr()
    already catches its own failures internally and simply leaves phase
    1's text-layer content in place rather than raising (individual
    Gemini calls within it already retry on rate-limit errors — see
    utils/gemini.py's _generate_content), so there's nothing here that
    would usefully be retried at the task level.
    """
    from .models import Document
    from .services import upgrade_document_with_vision_ocr

    try:
        document = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        logger.warning('upgrade_document_vision_ocr_task: document %s no longer exists', document_id)
        return

    upgrade_document_with_vision_ocr(document)



@shared_task(bind=True, max_retries=2, default_retry_delay=10)
def solve_scan_task(self, scan_id):
    """Solve a scan outside the HTTP request/response cycle."""
    from .models import ScanJob
    from .services import solve_scanned_problem

    try:
        scan = ScanJob.objects.get(id=scan_id)
    except ScanJob.DoesNotExist:
        logger.warning('solve_scan_task: scan %s no longer exists', scan_id)
        return

    try:
        solve_scanned_problem(scan)
    except Exception as exc:
        logger.exception('solve_scan_task failed for scan %s', scan_id)
        if self.request.is_eager or self.request.called_directly or self.request.retries >= self.max_retries:
            scan.status = ScanJob.ScanStatus.FAILED
            scan.error_message = str(exc)
            scan.save(update_fields=['status', 'error_message'])
            return
        raise self.retry(exc=exc)
