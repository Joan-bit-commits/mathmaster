import threading
import time
from pathlib import Path
from unittest.mock import patch

from django.test import TestCase

from curriculum.services import extract_pages_from_pdf

FIXTURE_PDF = Path(__file__).parent / "fixtures" / "covid_paper.pdf"  # 5 pages


class ParallelPageOcrTests(TestCase):
    """Verifies the concurrency itself, not just correctness — a naive
    sequential implementation would also pass ordinary "does it return
    the right text" tests. These specifically prove pages run in
    parallel, the concurrency cap is respected, and a single page's
    failure doesn't cost the rest of the document."""

    @patch("curriculum.services.gemini_configured", return_value=True)
    @patch("curriculum.services._page_to_png_bytes", return_value=b"fake-png-bytes")
    @patch("curriculum.services._ocr_image_bytes")
    def test_pages_run_concurrently_not_sequentially(self, mock_ocr, _mock_render, _mock_configured):
        """5 pages at ~0.2s each would take ~1.0s run sequentially. Run in
        parallel (cap of 5, so all 5 can go at once) it should take
        roughly one page's worth of time, not five.

        Page rendering itself is mocked out here — it's real, unavoidably
        sequential CPU-bound work (rendering this fixture's 5 pages alone
        measures ~0.5s), so timing it together with the OCR calls would
        confound "is rendering slow" with "is OCR parallel", which is the
        thing this test actually needs to isolate.
        """
        def slow_ocr(_image_bytes):
            time.sleep(0.2)
            return "text"

        mock_ocr.side_effect = slow_ocr
        started = time.monotonic()
        with open(FIXTURE_PDF, "rb") as f:
            pages = extract_pages_from_pdf(f)
        elapsed = time.monotonic() - started

        assert len(pages) == 5
        assert elapsed < 0.6, f"took {elapsed:.2f}s — pages do not appear to be running in parallel"

    @patch("curriculum.services.gemini_configured", return_value=True)
    @patch("curriculum.services.MAX_CONCURRENT_PAGE_OCR", 2)
    @patch("curriculum.services._ocr_image_bytes")
    def test_concurrency_is_capped(self, mock_ocr, _mock_configured):
        """With the cap set to 2 (well below the fixture's 5 pages), no
        more than 2 OCR calls should ever be in flight at once."""
        in_flight = 0
        max_seen = 0
        lock = threading.Lock()

        def tracked_ocr(_image_bytes):
            nonlocal in_flight, max_seen
            with lock:
                in_flight += 1
                max_seen = max(max_seen, in_flight)
            time.sleep(0.1)
            with lock:
                in_flight -= 1
            return "text"

        mock_ocr.side_effect = tracked_ocr
        with open(FIXTURE_PDF, "rb") as f:
            extract_pages_from_pdf(f)

        assert max_seen == 2, f"observed {max_seen} concurrent calls, expected the cap (2) to be hit exactly"

    @patch("curriculum.services.gemini_configured", return_value=True)
    @patch("curriculum.services._ocr_image_bytes")
    def test_one_page_failing_does_not_fail_the_whole_document(self, mock_ocr, _mock_configured):
        def flaky_ocr(image_bytes):
            # Fail deterministically on exactly one call by content size
            # proxy isn't reliable across pages of similar size, so use a
            # call counter instead.
            flaky_ocr.calls += 1
            if flaky_ocr.calls == 3:
                raise RuntimeError("simulated transient Gemini failure")
            return f"page text {flaky_ocr.calls}"

        flaky_ocr.calls = 0
        mock_ocr.side_effect = flaky_ocr

        with open(FIXTURE_PDF, "rb") as f:
            pages = extract_pages_from_pdf(f)

        assert len(pages) == 5
        failed = [text for _, text in pages if "could not be read" in text]
        succeeded = [text for _, text in pages if "could not be read" not in text]
        assert len(failed) == 1
        assert len(succeeded) == 4
        # Page numbers are still 1..5 in order regardless of which one failed.
        assert [n for n, _ in pages] == [1, 2, 3, 4, 5]

    @patch("curriculum.services.gemini_configured", return_value=True)
    @patch("curriculum.services._ocr_image_bytes")
    def test_every_page_failing_raises_instead_of_silently_succeeding(self, mock_ocr, _mock_configured):
        mock_ocr.side_effect = RuntimeError("Gemini is down")
        with open(FIXTURE_PDF, "rb") as f:
            with self.assertRaises(RuntimeError):
                extract_pages_from_pdf(f)

    @patch("curriculum.services.gemini_configured", return_value=True)
    @patch("curriculum.services._ocr_image_bytes")
    def test_page_order_is_correct_even_when_later_pages_finish_first(self, mock_ocr, _mock_configured):
        """Pages complete in whatever order the network calls happen to
        return in — the result must still be ordered by page number, not
        by completion order."""
        call_index = {"n": 0}
        lock = threading.Lock()

        def reverse_latency_ocr(_image_bytes):
            with lock:
                index = call_index["n"]
                call_index["n"] += 1
            # Earlier-submitted (earlier page) calls sleep longer, so
            # later pages finish first.
            time.sleep(0.15 - index * 0.03)
            return f"content-for-submission-{index}"

        mock_ocr.side_effect = reverse_latency_ocr
        with open(FIXTURE_PDF, "rb") as f:
            pages = extract_pages_from_pdf(f)

        # Page N's text must correspond to the Nth-submitted call, not to
        # whichever call happened to finish first.
        assert [text for _, text in pages] == [f"content-for-submission-{i}" for i in range(5)]
        assert [n for n, _ in pages] == [1, 2, 3, 4, 5]
