import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2, default_retry_delay=10)
def process_document_task(self, document_id):
    """Background wrapper around process_document().

    process_document() already records FAILED + processing_error on the
    document itself before re-raising, so this doesn't need special error
    handling beyond a retry for transient failures (a momentary Gemini API
    hiccup, a dropped connection) — a genuine, permanent failure (corrupt
    PDF, unsupported content) will just fail the same way on retry and stay
    recorded as FAILED, which is exactly what should happen.

    With CELERY_TASK_ALWAYS_EAGER=True (the default — see config/settings.py),
    calling process_document_task.delay(document.id) runs this synchronously
    in-process, in place, with no behavior change from calling
    process_document() directly. It only actually runs in the background
    once a real worker is running and CELERY_TASK_ALWAYS_EAGER=false.
    """
    from .models import Document
    from .services import process_document

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
