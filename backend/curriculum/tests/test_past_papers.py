from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from accounts.models import User
from curriculum.models import Document
from curriculum.services import extract_past_paper_questions


class PastPaperUploadTests(TestCase):
    """PastPaperUploadView overrides perform_create() entirely (to stamp
    document_type=PAST_PAPER), which meant it never inherited the
    auto-process-on-upload fix made on the base DocumentListCreateView —
    every uploaded past paper sat at `pending` forever."""

    def setUp(self):
        self.teacher = User.objects.create_user(username='teacher1', password='StrongPass1!', role='teacher')
        self.client_ = self._client()

    def _client(self):
        from rest_framework.test import APIClient

        api = APIClient()
        api.force_authenticate(user=self.teacher)
        return api

    @patch('curriculum.services.extract_pages_from_pdf', return_value=[(1, 'Q1. Solve 2x+5=13.')])
    def test_upload_is_processed_and_typed_as_past_paper(self, _mock_extract):
        resp = self.client_.post(
            '/api/teacher/past-papers/',
            {
                'title': 'UCE 2024 P1',
                'document_type': 'past_paper',
                'file': SimpleUploadedFile('paper.pdf', b'%PDF-1.4', content_type='application/pdf'),
            },
            format='multipart',
        )
        assert resp.status_code == 201
        document = Document.objects.get(id=resp.data['id'])
        assert document.document_type == Document.DocumentType.PAST_PAPER
        assert document.processing_status == Document.ProcessingStatus.READY
        assert document.extracted_text


class ExtractPastPaperQuestionsTests(TestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(username='teacher2', password='StrongPass1!', role='teacher')

    def _paper(self, status=Document.ProcessingStatus.READY, text='Q1. Solve 2x+5=13.\nQ2. Find the area.'):
        return Document.objects.create(
            owner=self.teacher,
            title='Paper',
            document_type=Document.DocumentType.PAST_PAPER,
            processing_status=status,
            extracted_text=text,
            file_size=4,
        )

    def test_raises_if_not_yet_processed(self):
        paper = self._paper(status=Document.ProcessingStatus.PENDING)
        with self.assertRaises(ValueError):
            extract_past_paper_questions(paper)

    @patch('curriculum.services.gemini_configured', return_value=False)
    def test_falls_back_to_line_splitting_without_gemini(self, _mock):
        paper = self._paper()
        questions = extract_past_paper_questions(paper)
        assert len(questions) == 2
        assert questions[0]['question'] == 'Q1. Solve 2x+5=13.'

    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services.ask_gemini_json')
    def test_uses_gemini_and_normalizes_messy_output(self, mock_json, _mock_configured):
        # Same lesson as the solution-step normalizer: Gemini's JSON isn't
        # schema-enforced, so marks/choices can come back oddly typed.
        mock_json.return_value = {
            'questions': [
                {'question': 'Solve 2x+5=13.', 'type': 'short-answer', 'marks': '5', 'choices': []},
                {'question': {'text': 'Pick the prime number.'}, 'type': 'multiple-choice', 'marks': 1, 'choices': [2, 3, 4]},
                {'question': '', 'marks': 1},  # blank question text -> dropped
                'not a dict',  # garbage entry -> dropped
            ]
        }
        paper = self._paper()
        questions = extract_past_paper_questions(paper)
        assert len(questions) == 2
        assert questions[0]['marks'] == 5
        assert questions[1]['question'] == 'Pick the prime number.'
        assert questions[1]['choices'] == ['2', '3', '4']


    @patch('curriculum.services.gemini_configured', return_value=True)
    @patch('curriculum.services.ask_gemini_json')
    def test_marks_arriving_as_a_string_is_coerced_not_defaulted(self, mock_json, _mock_configured):
        mock_json.return_value = {'questions': [{'question': 'Q?', 'marks': '4.0'}]}
        paper = self._paper()
        questions = extract_past_paper_questions(paper)
        assert questions[0]['marks'] == 4


    def setUp(self):
        from learning.models import Lesson, Topic

        self.teacher = User.objects.create_user(username='teacher3', password='StrongPass1!', role='teacher')
        self.topic = Topic.objects.create(name='Algebra', level='S1', subject='Mathematics', created_by=self.teacher)
        self.lesson = Lesson.objects.create(topic=self.topic, title='Linear equations', content='...')
        self.paper = Document.objects.create(
            owner=self.teacher,
            title='UCE 2024 P1',
            document_type=Document.DocumentType.PAST_PAPER,
            processing_status=Document.ProcessingStatus.READY,
            extracted_text='Q1. Solve 2x+5=13.',
            file_size=4,
        )

    def _client(self):
        from rest_framework.test import APIClient

        api = APIClient()
        api.force_authenticate(user=self.teacher)
        return api

    def test_creates_real_quiz_and_questions(self):
        from learning.models import Question, Quiz

        resp = self._client().post(
            f'/api/teacher/past-papers/{self.paper.id}/save-as-quiz/',
            {
                'lesson_id': self.lesson.id,
                'questions': [
                    {'question': 'Solve 2x+5=13.', 'type': 'short-answer', 'marks': 5, 'choices': []},
                    {'question': 'Find x if 3x=9.', 'type': 'short-answer', 'marks': 3, 'choices': []},
                ],
            },
            format='json',
        )
        assert resp.status_code == 201
        assert resp.data['question_count'] == 2
        quiz = Quiz.objects.get(id=resp.data['quiz_id'])
        assert quiz.lesson_id == self.lesson.id
        assert quiz.created_by == self.teacher
        assert Question.objects.filter(quiz=quiz).count() == 2

    def test_requires_lesson_id(self):
        resp = self._client().post(
            f'/api/teacher/past-papers/{self.paper.id}/save-as-quiz/',
            {'questions': [{'question': 'Q?'}]},
            format='json',
        )
        assert resp.status_code == 400

    def test_requires_at_least_one_question(self):
        resp = self._client().post(
            f'/api/teacher/past-papers/{self.paper.id}/save-as-quiz/',
            {'lesson_id': self.lesson.id, 'questions': []},
            format='json',
        )
        assert resp.status_code == 400

    def test_no_quiz_is_left_behind_when_every_question_is_invalid(self):
        from learning.models import Quiz

        resp = self._client().post(
            f'/api/teacher/past-papers/{self.paper.id}/save-as-quiz/',
            {'lesson_id': self.lesson.id, 'questions': [{'question': '   '}, 'garbage']},
            format='json',
        )
        assert resp.status_code == 400
        assert Quiz.objects.count() == 0

    def test_student_cannot_save_a_quiz(self):
        student = User.objects.create_user(username='student_pp', password='StrongPass1!', role='student')
        from rest_framework.test import APIClient

        api = APIClient()
        api.force_authenticate(user=student)
        resp = api.post(
            f'/api/teacher/past-papers/{self.paper.id}/save-as-quiz/',
            {'lesson_id': self.lesson.id, 'questions': [{'question': 'Q?'}]},
            format='json',
        )
        assert resp.status_code == 403
