from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from accounts.models import User
from curriculum.models import Document
from curriculum.services import process_document


class DocumentImageOcrTests(TestCase):
    """Fix 5: image documents (JPEG/PNG) must be OCR'd via Gemini Vision,
    not handed to pdfplumber (which only understands PDFs and would always
    fail for an image, leaving the document stuck FAILED forever)."""

    def setUp(self):
        self.user = User.objects.create_user(username='owner', password='StrongPass1!')

    @patch('curriculum.services.ask_gemini_vision_text', return_value='Transcribed worksheet text.')
    def test_image_upload_is_processed_via_vision_ocr(self, mock_ocr):
        document = Document.objects.create(
            owner=self.user,
            title='Worksheet photo',
            file=SimpleUploadedFile('worksheet.png', b'\x89PNG\r\n\x1a\n', content_type='image/png'),
            file_size=8,
        )
        process_document(document)
        document.refresh_from_db()

        mock_ocr.assert_called_once()
        self.assertEqual(document.processing_status, Document.ProcessingStatus.READY)
        self.assertEqual(document.extracted_text, 'Transcribed worksheet text.')
        self.assertEqual(document.page_count, 1)
        self.assertEqual(document.chunks.count(), 1)
        self.assertEqual(document.chunks.first().page_number, 1)

    @patch('curriculum.services.ask_gemini_vision_text', side_effect=RuntimeError('Gemini API key is not configured.'))
    def test_image_processing_failure_is_recorded_clearly(self, _mock_ocr):
        document = Document.objects.create(
            owner=self.user,
            title='Worksheet photo',
            file=SimpleUploadedFile('worksheet.jpg', b'\xff\xd8\xff', content_type='image/jpeg'),
            file_size=3,
        )
        with self.assertRaises(RuntimeError):
            process_document(document)
        document.refresh_from_db()
        self.assertEqual(document.processing_status, Document.ProcessingStatus.FAILED)
        self.assertIn('Gemini', document.processing_error)
