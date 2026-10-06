from pathlib import Path
from unittest.mock import patch

from django.test import TestCase

from curriculum.services import _pdf_text_pages, _pdf_vision_pages, extract_pages

FIXTURE_PDF = Path(__file__).parent / 'fixtures' / 'covid_paper.pdf'


class PdfTextPagesTests(TestCase):
    """Phase 1 — the fast pdfplumber text-layer pass. pdfplumber's text
    layer only captures actual text characters — a math exam paper
    converted from Word typically has every formula inserted via an
    equation editor, which embeds it as a raster image with no text layer
    at all. pdfplumber silently drops those, so a document that's
    entirely exam questions loses essentially all of its mathematical
    content while looking like extraction "worked" (some text came back,
    just not the formulas). That's an accepted, documented trade-off for
    phase 1 now — see upgrade_document_with_vision_ocr for phase 2, which
    recovers them."""

    def test_gets_the_prose_but_not_the_formulas(self):
        with open(FIXTURE_PDF, 'rb') as f:
            pages = _pdf_text_pages(f)
        page_1_text = pages[0][1]
        assert 'Find m if' in page_1_text  # prose: present
        assert 'Solve for n if' in page_1_text  # prose: present
        # The actual formula for Q3, (3/5)^(n-1) = (25/9)^n, is embedded
        # as an image and never appears in the text layer at all.
        assert '25' not in page_1_text.split('Solve for n if')[1].split('\n')[0]

    def test_page_numbers_are_correct(self):
        with open(FIXTURE_PDF, 'rb') as f:
            pages = _pdf_text_pages(f)
        assert [p[0] for p in pages] == list(range(1, len(pages) + 1))

    def test_does_not_touch_gemini_at_all(self):
        """Phase 1 must never depend on Gemini being configured or
        reachable — that's the whole point of it being the fast, always-
        available first pass."""
        with patch('curriculum.services.gemini_configured', return_value=False):
            with open(FIXTURE_PDF, 'rb') as f:
                pages = _pdf_text_pages(f)
        assert len(pages) >= 1
        assert 'Find m if' in pages[0][1]


class PdfVisionPagesTests(TestCase):
    """Phase 2 — the slower Gemini Vision pass, used by
    upgrade_document_with_vision_ocr to recover the formulas phase 1
    misses. Uses the actual reported PDF as a fixture."""

    @patch('curriculum.services._ocr_image_bytes')
    def test_vision_path_is_used_once_per_page(self, mock_ocr):
        mock_ocr.return_value = 'transcribed page text including formulas'
        with open(FIXTURE_PDF, 'rb') as f:
            pages = _pdf_vision_pages(f)

        assert mock_ocr.call_count == len(pages)
        assert all(text == 'transcribed page text including formulas' for _, text in pages)
        # Real page-image bytes were actually rendered and handed to OCR,
        # not skipped/faked — confirms the rendering pipeline itself runs.
        first_call_bytes = mock_ocr.call_args_list[0].args[0]
        assert isinstance(first_call_bytes, bytes)
        assert len(first_call_bytes) > 1000  # a real PNG, not an empty stub

    @patch('curriculum.services._ocr_image_bytes')
    def test_page_numbers_stay_correct(self, mock_ocr):
        mock_ocr.side_effect = lambda image_bytes: 'page text'
        with open(FIXTURE_PDF, 'rb') as f:
            pages = _pdf_vision_pages(f)
        assert [p[0] for p in pages] == list(range(1, len(pages) + 1))


class ExtractPagesPhase1DispatchTests(TestCase):
    """extract_pages() is phase 1's dispatcher — for a PDF, it must
    always use the fast text pass, never Vision, regardless of whether
    Gemini is configured (Vision for a PDF only ever happens in phase 2,
    upgrade_document_with_vision_ocr)."""

    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services._ocr_image_bytes')
    def test_pdf_never_calls_vision_even_when_gemini_is_configured(self, mock_ocr, _mock_configured):
        document = type('Doc', (), {'file': open(FIXTURE_PDF, 'rb')})()
        try:
            pages = extract_pages(document)
        finally:
            document.file.close()
        assert mock_ocr.call_count == 0
        assert 'Find m if' in pages[0][1]
