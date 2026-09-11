from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from accounts.models import User
from curriculum.models import Document, ScanJob
from curriculum.services import extract_past_paper_questions, solve_scanned_problem
from utils.gemini import _repair_stray_backslashes, ask_gemini_json


class RepairStrayBackslashesTests(TestCase):
    def test_latex_backslashes_get_doubled(self):
        raw = r'{"text": "a, b, c \in \mathbb{R}"}'
        repaired = _repair_stray_backslashes(raw)
        # Every backslash that wasn't already a valid JSON escape start
        # should now be doubled, making the string parseable.
        import json

        parsed = json.loads(repaired)
        assert parsed['text'] == r'a, b, c \in \mathbb{R}'

    def test_valid_escapes_are_left_alone(self):
        raw = r'{"text": "line one\nline two", "quote": "she said \"hi\""}'
        import json

        # Already valid JSON — repair must not corrupt it.
        assert json.loads(_repair_stray_backslashes(raw)) == json.loads(raw)


class AskGeminiJsonTests(TestCase):
    """Reproduces the exact failure mode from production logs: Gemini
    writing math notation (\\in, \\mathbb{R}, etc.) as raw, unescaped
    backslashes inside a JSON string, which isn't valid JSON."""

    @patch('utils.gemini.ask_gemini')
    def test_recovers_from_latex_backslashes_via_repair(self, mock_ask):
        mock_ask.return_value = (
            '{"problem_text": "Let $a, b, c \\in \\mathbb{R}$", "final_answer": "x=4"}'
        )
        result = ask_gemini_json('solve this')
        assert result['final_answer'] == 'x=4'
        assert '\\in' in result['problem_text']

    @patch('utils.gemini.ask_gemini')
    def test_raises_when_still_unparseable_after_repair(self, mock_ask):
        mock_ask.return_value = '{"unterminated": '
        with pytest.raises(RuntimeError):
            ask_gemini_json('solve this')

    @patch('utils.gemini.ask_gemini')
    def test_valid_json_passes_through_untouched(self, mock_ask):
        mock_ask.return_value = '{"a": 1, "b": [1, 2, 3]}'
        assert ask_gemini_json('x') == {'a': 1, 'b': [1, 2, 3]}


class ScanSolveSurfacesParsingFailureTests(TestCase):
    """Before this fix, a Gemini JSON parse failure here was swallowed:
    ask_gemini_json silently returned {}, and the scan was saved as READY
    with a blank problem_text/steps/final_answer — a 201 response that
    looked successful but gave the student nothing. It should fail loudly
    and land the scan in FAILED with a clear error instead."""

    def setUp(self):
        self.user = User.objects.create_user(username='scanner2', password='StrongPass1!')
        self.scan = ScanJob.objects.create(
            user=self.user, image=SimpleUploadedFile('problem.jpg', b'\xff\xd8\xff', content_type='image/jpeg')
        )

    @patch('curriculum.services.ask_gemini_json', side_effect=RuntimeError('Gemini returned a response that could not be parsed as JSON.'))
    @patch('utils.gemini._call_gemini_vision')
    @patch('curriculum.services.gemini_configured', return_value=True)
    def test_unparseable_gemini_response_raises_not_silently_blank(self, _mock_configured, mock_vision, _mock_json):
        mock_vision.return_value = {'text': '2x+5=13', 'uneb_code': '', 'topic': 'Algebra'}
        with self.assertRaises(RuntimeError):
            solve_scanned_problem(self.scan)


class PastPaperExtractSurfacesParsingFailureTests(TestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(username='teacher_pp2', password='StrongPass1!', role='teacher')
        self.paper = Document.objects.create(
            owner=self.teacher,
            title='Paper',
            document_type=Document.DocumentType.PAST_PAPER,
            processing_status=Document.ProcessingStatus.READY,
            extracted_text='Q1. Find m if (1*3)*m=18.',
            file_size=4,
        )

    def _client(self):
        from rest_framework.test import APIClient

        api = APIClient()
        api.force_authenticate(user=self.teacher)
        return api

    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services.ask_gemini_json', side_effect=RuntimeError('Gemini returned a response that could not be parsed as JSON.'))
    def test_returns_502_instead_of_empty_200(self, _mock_json, _mock_configured):
        resp = self._client().get(f'/api/teacher/past-papers/{self.paper.id}/extract-quiz/')
        assert resp.status_code == 502
        assert 'detail' in resp.data
