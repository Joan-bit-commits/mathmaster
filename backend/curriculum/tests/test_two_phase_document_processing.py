from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from accounts.models import User
from curriculum.models import Document, DocumentChunk
from curriculum.services import process_document, upgrade_document_with_vision_ocr
from curriculum.tasks import process_document_task


@pytest.fixture
def student(db):
    return User.objects.create_user(username='two_phase_student', password='StrongPass1!')


def _pdf_document(student):
    return Document.objects.create(
        owner=student,
        title='Notes',
        file=SimpleUploadedFile('notes.pdf', b'%PDF-1.4', content_type='application/pdf'),
        file_size=4,
    )


@pytest.mark.django_db
class TestPhase1IsTextOnlyAndImmediate:
    """process_document() (phase 1) must never touch Vision OCR for a PDF,
    even when Gemini is configured — that's the whole point of splitting
    it out. A document should be READY, with real chunks, right after
    phase 1 alone."""

    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services._ocr_image_bytes')
    @patch('curriculum.services._pdf_text_pages', return_value=[(1, 'Solve for x: 2x + 5 = 13.')])
    def test_pdf_processing_never_calls_vision_even_when_gemini_is_configured(
        self, _mock_text_pages, mock_ocr, _mock_configured, student
    ):
        document = _pdf_document(student)
        process_document(document)
        document.refresh_from_db()

        assert mock_ocr.call_count == 0
        assert document.processing_status == Document.ProcessingStatus.READY
        assert document.chunks.exists()
        assert document.used_vision_ocr is False


@pytest.mark.django_db
class TestPhase2VisionUpgrade:
    def _ready_pdf_document(self, student):
        document = _pdf_document(student)
        with patch('curriculum.services._pdf_text_pages', return_value=[(1, 'text-layer version')]):
            process_document(document)
        document.refresh_from_db()
        return document

    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services._pdf_vision_pages', return_value=[(1, 'vision-ocr version with $x^2$')])
    def test_upgrade_replaces_chunks_and_marks_used_vision_ocr(self, _mock_vision, _mock_configured, student):
        document = self._ready_pdf_document(student)
        text_layer_chunk_ids = set(document.chunks.values_list('id', flat=True))

        upgrade_document_with_vision_ocr(document)
        document.refresh_from_db()

        assert document.used_vision_ocr is True
        assert 'vision-ocr version' in document.extracted_text
        new_chunk_ids = set(document.chunks.values_list('id', flat=True))
        assert new_chunk_ids.isdisjoint(text_layer_chunk_ids)  # old chunks genuinely replaced, not appended to
        assert document.chunks.count() == 1

    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services._pdf_vision_pages', side_effect=RuntimeError('rate limit exhausted'))
    def test_a_failed_upgrade_keeps_the_text_layer_content_and_does_not_raise(
        self, _mock_vision, _mock_configured, student
    ):
        document = self._ready_pdf_document(student)
        original_text = document.extracted_text
        original_chunk_count = document.chunks.count()

        upgrade_document_with_vision_ocr(document)  # must not raise
        document.refresh_from_db()

        assert document.used_vision_ocr is False
        assert document.extracted_text == original_text
        assert document.chunks.count() == original_chunk_count
        assert document.processing_status == Document.ProcessingStatus.READY  # untouched by the failed upgrade

    @patch('curriculum.services.gemini_configured', return_value=False)
    @patch('curriculum.services._pdf_vision_pages')
    def test_is_a_noop_when_gemini_is_not_configured(self, mock_vision, _mock_configured, student):
        document = self._ready_pdf_document(student)
        upgrade_document_with_vision_ocr(document)
        mock_vision.assert_not_called()

    @patch('curriculum.services._pdf_vision_pages')
    def test_is_a_noop_for_image_documents(self, mock_vision, student):
        document = Document.objects.create(
            owner=student,
            title='Worksheet photo',
            file=SimpleUploadedFile('worksheet.png', b'\x89PNG\r\n\x1a\n', content_type='image/png'),
            file_size=8,
        )
        # Images get their one (Vision) pass inside phase 1 itself — phase
        # 2 has nothing to do for them.
        upgrade_document_with_vision_ocr(document)
        mock_vision.assert_not_called()


@pytest.mark.django_db
class TestTaskChaining:
    """process_document_task (phase 1) should dispatch
    upgrade_document_vision_ocr_task (phase 2) once phase 1 succeeds —
    but only for a PDF, and only when Gemini is configured."""

    @patch('curriculum.tasks.upgrade_document_vision_ocr_task')
    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services._pdf_text_pages', return_value=[(1, 'text')])
    def test_dispatches_phase_2_for_a_pdf_when_gemini_is_configured(
        self, _mock_text_pages, _mock_configured, mock_phase2_task, student
    ):
        document = _pdf_document(student)
        process_document_task(document.id)
        mock_phase2_task.delay.assert_called_once_with(document.id)

    @patch('curriculum.tasks.upgrade_document_vision_ocr_task')
    @patch('curriculum.services.gemini_configured', return_value=False)
    @patch('curriculum.services._pdf_text_pages', return_value=[(1, 'text')])
    def test_does_not_dispatch_phase_2_when_gemini_is_not_configured(
        self, _mock_text_pages, _mock_configured, mock_phase2_task, student
    ):
        document = _pdf_document(student)
        process_document_task(document.id)
        mock_phase2_task.delay.assert_not_called()

    @patch('curriculum.tasks.upgrade_document_vision_ocr_task')
    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services.ask_gemini_vision_text', return_value='transcribed')
    def test_does_not_dispatch_phase_2_for_an_image_document(
        self, _mock_ocr, _mock_configured, mock_phase2_task, student
    ):
        document = Document.objects.create(
            owner=student,
            title='Worksheet photo',
            file=SimpleUploadedFile('worksheet.png', b'\x89PNG\r\n\x1a\n', content_type='image/png'),
            file_size=8,
        )
        process_document_task(document.id)
        mock_phase2_task.delay.assert_not_called()


@pytest.mark.django_db
class TestQaWorksAfterPhase1Alone:
    """The actual point of this split: Q&A (and therefore
    DocumentChatSession creation) must work right after phase 1, without
    waiting for — or requiring — the Vision OCR upgrade to ever run."""

    @patch('curriculum.services._pdf_text_pages', return_value=[(1, 'Solve for x: 2x + 5 = 13.')])
    def test_chunks_exist_and_are_queryable_immediately_after_phase_1(self, _mock_text_pages, student):
        document = _pdf_document(student)
        process_document(document)
        document.refresh_from_db()

        from curriculum.services import retrieve_relevant_chunks

        chunks = retrieve_relevant_chunks(document, 'How do I solve 2x+5=13?')
        assert len(chunks) > 0  # a session-creating Q&A call has something to answer from
        assert isinstance(chunks[0], DocumentChunk)
