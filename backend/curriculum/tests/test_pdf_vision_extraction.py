from pathlib import Path
from unittest.mock import patch

from django.test import TestCase

from curriculum.services import extract_pages_from_pdf

FIXTURE_PDF = Path(__file__).parent / 'fixtures' / 'covid_paper.pdf'


class ExtractPagesFromPdfVisionTests(TestCase):
    """pdfplumber's text layer only captures actual text characters — a
    math exam paper converted from Word typically has every formula
    inserted via an equation editor, which embeds it as a raster image
    with no text layer at all. pdfplumber silently drops those, so a
    document that's entirely exam questions loses essentially all of its
    mathematical content while looking like extraction "worked" (some
    text came back, just not the formulas).

    These tests use the actual reported PDF as a fixture, confirming both
    failure modes directly: (1) the plain-text fallback really does lose
    the formulas, and (2) the Vision path is what actually gets called
    once per page when Gemini is configured."""

    def test_plain_text_fallback_loses_the_formulas(self):
        """Documents the exact bug: without Gemini configured, the text
        layer alone gets back the prose around each question but not the
        formula itself."""
        with open(FIXTURE_PDF, 'rb') as f:
            pages = extract_pages_from_pdf(f)
        page_1_text = pages[0][1]
        assert 'Find m if' in page_1_text  # prose: present
        assert 'Solve for n if' in page_1_text  # prose: present
        # The actual formula for Q3, (3/5)^(n-1) = (25/9)^n, is embedded
        # as an image and never appears in the text layer at all.
        assert '25' not in page_1_text.split('Solve for n if')[1].split('\n')[0]

    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services._ocr_image_bytes')
    def test_vision_path_is_used_once_per_page_when_gemini_is_configured(self, mock_ocr, _mock_configured):
        mock_ocr.return_value = 'transcribed page text including formulas'
        with open(FIXTURE_PDF, 'rb') as f:
            pages = extract_pages_from_pdf(f)

        assert mock_ocr.call_count == len(pages)
        assert all(text == 'transcribed page text including formulas' for _, text in pages)
        # Real page-image bytes were actually rendered and handed to OCR,
        # not skipped/faked — confirms the rendering pipeline itself runs.
        first_call_bytes = mock_ocr.call_args_list[0].args[0]
        assert isinstance(first_call_bytes, bytes)
        assert len(first_call_bytes) > 1000  # a real PNG, not an empty stub

    @patch('curriculum.services.gemini_configured', return_value=False)
    def test_falls_back_to_plain_text_without_gemini(self, _mock_configured):
        with open(FIXTURE_PDF, 'rb') as f:
            pages = extract_pages_from_pdf(f)
        assert len(pages) >= 1
        assert 'Find m if' in pages[0][1]

    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services._ocr_image_bytes')
    def test_page_numbers_stay_correct_under_the_vision_path(self, mock_ocr, _mock_configured):
        mock_ocr.side_effect = lambda image_bytes: 'page text'
        with open(FIXTURE_PDF, 'rb') as f:
            pages = extract_pages_from_pdf(f)
        assert [p[0] for p in pages] == list(range(1, len(pages) + 1))
