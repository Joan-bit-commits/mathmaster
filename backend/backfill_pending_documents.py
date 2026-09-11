"""One-off script: process any Document rows stuck at `pending` from before
the auto-process-on-upload fix. Run once from the backend directory:

    python3 manage.py shell < /tmp/backfill_pending_documents.py

or paste into `python3 manage.py shell` interactively.
"""
from curriculum.models import Document
from curriculum.services import process_document

pending = Document.objects.filter(processing_status=Document.ProcessingStatus.PENDING)
print(f"Found {pending.count()} pending document(s).")

for document in pending:
    try:
        process_document(document)
        print(f"  [{document.id}] {document.title!r} -> {document.processing_status}")
    except Exception as exc:
        print(f"  [{document.id}] {document.title!r} -> FAILED: {exc}")
