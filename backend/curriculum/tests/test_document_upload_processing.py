from unittest.mock import patch

import pytest
from rest_framework.test import APIClient

from curriculum.models import Document


@pytest.mark.django_db
class TestDocumentUploadTriggersProcessing:
    """The mobile app has no separate 'process this document' step and
    never calls POST /process/ — before this fix, every uploaded document
    sat at processing_status='pending' forever."""

    def _client(self, student):
        api = APIClient()
        api.force_authenticate(user=student)
        return api

    def _pdf_upload(self, title='Notes'):
        from django.core.files.uploadedfile import SimpleUploadedFile

        return {
            'title': title,
            'document_type': 'notes',
            'file': SimpleUploadedFile('notes.pdf', b'%PDF-1.4', content_type='application/pdf'),
        }

    @patch('curriculum.services.extract_pages_from_pdf', return_value=[(1, 'Linear equations: solve for x.')])
    def test_upload_response_is_processed_and_includes_an_id(self, _mock_extract, student):
        client = self._client(student)
        resp = client.post('/api/documents/', self._pdf_upload(), format='multipart')

        assert resp.status_code == 201
        assert resp.data['id'] is not None
        assert resp.data['processing_status'] == Document.ProcessingStatus.READY
        assert resp.data['extracted_text']

        document = Document.objects.get(id=resp.data['id'])
        assert document.processing_status == Document.ProcessingStatus.READY
        assert document.chunks.exists()

    @patch('curriculum.services.extract_pages_from_pdf', side_effect=RuntimeError('corrupt pdf'))
    def test_upload_still_succeeds_when_processing_fails(self, _mock_extract, student):
        """A processing failure shouldn't cost the student their upload —
        they should see the document (marked failed, so they can retry)
        rather than a 500 and a vanished file."""
        client = self._client(student)
        resp = client.post('/api/documents/', self._pdf_upload(), format='multipart')

        assert resp.status_code == 201
        assert resp.data['processing_status'] == Document.ProcessingStatus.FAILED
        assert 'corrupt pdf' in resp.data['processing_error']
