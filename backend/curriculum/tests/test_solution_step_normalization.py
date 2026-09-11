from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from accounts.models import User
from curriculum.models import ScanJob
from curriculum.services import _coerce_mark, _coerce_text, _normalize_solution_steps, solve_scanned_problem


class NormalizeSolutionStepsTests(TestCase):
    """Gemini's JSON output isn't schema-enforced, so `steps` can come back
    in several different shapes depending on the call. Every shape here has
    actually been observed to crash the mobile SolutionStep component with
    'Objects are not valid as a React child' before this fix."""

    def test_expected_shape_passes_through(self):
        steps = _normalize_solution_steps([{'step': 1, 'text': 'Subtract 5 from both sides.', 'mark': 1}])
        self.assertEqual(steps, [{'step': 1, 'text': 'Subtract 5 from both sides.', 'mark': 1}])

    def test_list_of_plain_strings(self):
        steps = _normalize_solution_steps(['Subtract 5.', 'Divide by 2.'])
        self.assertEqual(steps[0], {'step': 1, 'text': 'Subtract 5.', 'mark': None})
        self.assertEqual(steps[1], {'step': 2, 'text': 'Divide by 2.', 'mark': None})

    def test_alternate_key_names(self):
        steps = _normalize_solution_steps([{'step_number': 1, 'description': 'Simplify the expression.'}])
        self.assertEqual(steps[0]['step'], 1)
        self.assertEqual(steps[0]['text'], 'Simplify the expression.')

    def test_nested_object_for_text_does_not_crash(self):
        steps = _normalize_solution_steps(
            [{'step': 1, 'text': {'en': 'Subtract 5 from both sides.'}, 'mark': {'marks': 2}}]
        )
        self.assertEqual(steps[0]['text'], 'Subtract 5 from both sides.')
        self.assertEqual(steps[0]['mark'], 2)

    def test_single_string_instead_of_a_list(self):
        steps = _normalize_solution_steps('Just solve it.')
        self.assertEqual(steps, [{'step': 1, 'text': 'Just solve it.', 'mark': None}])

    def test_none_or_garbage_becomes_empty_list(self):
        self.assertEqual(_normalize_solution_steps(None), [])
        self.assertEqual(_normalize_solution_steps(42), [])
        self.assertEqual(_normalize_solution_steps({'not': 'a list'}), [])

    def test_non_dict_items_are_skipped_not_fatal(self):
        steps = _normalize_solution_steps([{'text': 'Good step.'}, 42, None])
        self.assertEqual(len(steps), 1)
        self.assertEqual(steps[0]['text'], 'Good step.')


class CoerceTextTests(TestCase):
    def test_string_passes_through(self):
        self.assertEqual(_coerce_text('x = 4'), 'x = 4')

    def test_number_becomes_string(self):
        self.assertEqual(_coerce_text(4), '4')

    def test_nested_dict_extracts_a_readable_value(self):
        self.assertEqual(_coerce_text({'value': 'x = 4', 'unit': 'none'}), 'x = 4')

    def test_unusable_value_falls_back(self):
        self.assertEqual(_coerce_text(None, fallback='n/a'), 'n/a')


class CoerceMarkTests(TestCase):
    def test_scalar_passes_through(self):
        self.assertEqual(_coerce_mark(2), 2)

    def test_dict_extracts_numeric_value(self):
        self.assertEqual(_coerce_mark({'marks': 3}), 3)

    def test_none_stays_none(self):
        self.assertIsNone(_coerce_mark(None))


class SolveScannedProblemNormalizationTests(TestCase):
    """End-to-end: even when Gemini returns a messy shape, the ScanJob saved
    to the database has a guaranteed-safe shape for the mobile client."""

    def setUp(self):
        self.user = User.objects.create_user(username='scanner', password='StrongPass1!')
        self.scan = ScanJob.objects.create(
            user=self.user, image=SimpleUploadedFile('problem.jpg', b'\xff\xd8\xff', content_type='image/jpeg')
        )

    @patch('curriculum.services.ask_gemini_json')
    @patch('utils.gemini._call_gemini_vision')
    @patch('curriculum.services.gemini_configured', return_value=True)
    def test_messy_gemini_output_is_normalized_before_saving(self, _mock_configured, mock_vision, mock_json):
        mock_vision.return_value = {'text': '2x + 5 = 13', 'uneb_code': '', 'topic': 'Linear equations'}
        mock_json.return_value = {
            'problem_text': {'value': '2x + 5 = 13'},
            'steps': ['Subtract 5 from both sides.', {'text': {'en': 'Divide by 2.'}, 'mark': {'marks': 1}}],
            'final_answer': {'value': 'x = 4'},
        }
        solve_scanned_problem(self.scan)

        self.scan.refresh_from_db()
        self.assertEqual(self.scan.status, ScanJob.ScanStatus.READY)
        self.assertEqual(self.scan.problem_text, '2x + 5 = 13')
        self.assertEqual(self.scan.final_answer, 'x = 4')
        self.assertEqual(len(self.scan.solution_steps), 2)
        self.assertEqual(self.scan.solution_steps[0]['text'], 'Subtract 5 from both sides.')
        self.assertEqual(self.scan.solution_steps[1]['text'], 'Divide by 2.')
        self.assertEqual(self.scan.solution_steps[1]['mark'], 1)
        # Every value that will be rendered directly as a React child must be
        # a primitive — this is the actual regression guard for the crash.
        for step in self.scan.solution_steps:
            self.assertIsInstance(step['text'], str)
            self.assertTrue(step['mark'] is None or isinstance(step['mark'], (str, int, float)))
