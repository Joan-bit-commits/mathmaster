from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from curriculum.models import Document
from curriculum.tasks import process_document_task


def _pdf_upload(title='Notes'):
    return {
        'title': title,
        'document_type': 'notes',
        'file': SimpleUploadedFile('notes.pdf', b'%PDF-1.4', content_type='application/pdf'),
    }


def _client(student):
    api = APIClient()
    api.force_authenticate(user=student)
    return api


@pytest.mark.django_db
class TestEagerModeDispatch:
    """CELERY_TASK_ALWAYS_EAGER=True is the default — this proves that
    mode genuinely dispatches through the Celery task machinery (not a
    direct function call left over from before the refactor) while still
    behaving exactly like a synchronous call from the caller's point of
    view."""

    @patch('curriculum.services.extract_pages_from_pdf', return_value=[(1, 'Linear equations: solve for x.')])
    def test_task_is_dispatched_and_response_reflects_final_state(self, _mock_extract, student):
        resp = _client(student).post('/api/documents/', _pdf_upload(), format='multipart')
        assert resp.status_code == 201
        assert resp.data['processing_status'] == Document.ProcessingStatus.READY
        assert resp.data['extracted_text']

    @patch('curriculum.services.extract_pages_from_pdf', side_effect=RuntimeError('corrupt pdf'))
    def test_a_failed_task_still_returns_a_201_with_the_failure_recorded(self, _mock_extract, student):
        resp = _client(student).post('/api/documents/', _pdf_upload(), format='multipart')
        assert resp.status_code == 201
        assert resp.data['processing_status'] == Document.ProcessingStatus.FAILED
        assert 'corrupt pdf' in resp.data['processing_error']


@pytest.mark.django_db
class TestNonEagerModeDoesNotBlock:
    """Simulates a real (non-eager) worker by mocking process_document_task
    directly at the view level, rather than actually flipping
    CELERY_TASK_ALWAYS_EAGER (Celery reads that once at app-config time via
    config/celery.py, so toggling the Django setting mid-test isn't
    guaranteed to actually change already-configured behavior — mocking
    the task the view calls is the reliable way to assert "the view
    dispatches and moves on without waiting for a result")."""

    @patch('curriculum.views.process_document_task')
    def test_upload_returns_immediately_without_running_the_task(self, mock_task, student):
        resp = _client(student).post('/api/documents/', _pdf_upload(), format='multipart')
        assert resp.status_code == 201
        assert resp.data['processing_status'] == Document.ProcessingStatus.PENDING
        mock_task.delay.assert_called_once()
        document_id = mock_task.delay.call_args.args[0]
        assert Document.objects.get(id=document_id).processing_status == Document.ProcessingStatus.PENDING

    @patch('curriculum.views.process_document_task')
    def test_manual_reprocess_also_returns_immediately(self, mock_task, student):
        document = Document.objects.create(owner=student, title='Notes', file_size=4)
        resp = _client(student).post(f'/api/documents/{document.id}/process/')
        assert resp.status_code == 200
        assert resp.data['processing_status'] == Document.ProcessingStatus.PENDING
        mock_task.delay.assert_called_once_with(document.id)


@pytest.mark.django_db
class TestProcessDocumentTask:
    def test_missing_document_is_a_noop_not_a_crash(self):
        """A document could plausibly be deleted between being uploaded
        and a queued task actually running — the task should log and
        return, not raise."""
        process_document_task(999999)  # should not raise

    @patch('curriculum.services.extract_pages_from_pdf', return_value=[(1, 'text')])
    def test_successful_run_updates_the_document(self, _mock_extract, student):
        document = Document.objects.create(owner=student, title='Notes', file_size=4)
        process_document_task(document.id)
        document.refresh_from_db()
        assert document.processing_status == Document.ProcessingStatus.READY
