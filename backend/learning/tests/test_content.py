import pytest
from rest_framework import status

from learning.models import Attempt, Lesson, Question, Quiz, Topic


def _make_topic(name='Algebra', level='S1', **kwargs):
    return Topic.objects.create(
        name=name, description='Algebra basics', level=level, subject='Mathematics', **kwargs
    )


@pytest.mark.django_db
class TestTopicCRUDAndPermissions:
    def test_list_requires_auth(self, anon_client):
        resp = anon_client.get('/api/learning/topics/')
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_topics(self, student_client):
        _make_topic()
        resp = student_client.get('/api/learning/topics/')
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['count'] == 1

    def test_topic_filter_by_level_and_subject(self, student_client):
        _make_topic(name='Algebra', level='S1')
        _make_topic(name='Trig', level='S3')
        resp = student_client.get('/api/learning/topics/?level=S3&subject=Mathematics')
        assert resp.data['count'] == 1
        assert resp.data['results'][0]['name'] == 'Trig'

    def test_student_cannot_create_topic(self, student_client):
        resp = student_client.post('/api/learning/topics/', {
            'name': 'X', 'description': 'y',
        }, format='json')
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_teacher_can_create_topic(self, teacher_client, teacher):
        resp = teacher_client.post('/api/learning/topics/', {
            'name': 'Geometry', 'description': 'Shapes', 'level': 'S1', 'subject': 'Mathematics',
        }, format='json')
        assert resp.status_code == status.HTTP_201_CREATED
        assert Topic.objects.get(name='Geometry').created_by == teacher

    def test_teacher_cannot_edit_others_topic(self, teacher_client, db, django_user_model):
        other = django_user_model.objects.create_user(username='t2', password='Str0ngPass!', role='teacher')
        topic = _make_topic(created_by=other)
        resp = teacher_client.patch(
            f'/api/learning/topics/{topic.id}/', {'description': 'hacked'}, format='json')
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_teacher_can_edit_own_topic(self, teacher_client, teacher):
        topic = _make_topic(created_by=teacher)
        resp = teacher_client.patch(
            f'/api/learning/topics/{topic.id}/', {'description': 'updated'}, format='json')
        assert resp.status_code == status.HTTP_200_OK

    def test_admin_can_edit_any_topic(self, admin_client, db, django_user_model):
        other = django_user_model.objects.create_user(username='t3', password='Str0ngPass!', role='teacher')
        topic = _make_topic(created_by=other)
        resp = admin_client.patch(
            f'/api/learning/topics/{topic.id}/', {'description': 'admin edit'}, format='json')
        assert resp.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestNestedAuthoring:
    def test_teacher_creates_lesson_under_topic(self, teacher_client, teacher):
        topic = _make_topic(created_by=teacher)
        resp = teacher_client.post(f'/api/learning/topics/{topic.id}/lessons/', {
            'title': 'Lesson 1', 'content': 'Body',
        }, format='json')
        assert resp.status_code == status.HTTP_201_CREATED
        assert Lesson.objects.get(title='Lesson 1').created_by == teacher

    def test_teacher_creates_quiz_under_lesson(self, teacher_client, teacher):
        topic = _make_topic(created_by=teacher)
        lesson = Lesson.objects.create(topic=topic, title='L', content='C')
        resp = teacher_client.post(f'/api/learning/lessons/{lesson.id}/quizzes/', {
            'title': 'Quiz 1', 'description': 'D',
        }, format='json')
        assert resp.status_code == status.HTTP_201_CREATED

    def test_teacher_creates_question_validates_choices(self, teacher_client, teacher):
        topic = _make_topic(created_by=teacher)
        lesson = Lesson.objects.create(topic=topic, title='L', content='C')
        quiz = Quiz.objects.create(lesson=lesson, title='Q', description='D')
        resp = teacher_client.post(f'/api/learning/quizzes/{quiz.id}/questions/', {
            'question_text': 'Pick one', 'choices': ['A', 'B'], 'correct_answer': 'C',
        }, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

        resp = teacher_client.post(f'/api/learning/quizzes/{quiz.id}/questions/', {
            'question_text': 'Pick one', 'choices': ['A', 'B'], 'correct_answer': 'A',
        }, format='json')
        assert resp.status_code == status.HTTP_201_CREATED

    def test_bulk_questions_max_100(self, teacher_client, teacher):
        topic = _make_topic(created_by=teacher)
        lesson = Lesson.objects.create(topic=topic, title='L', content='C')
        quiz = Quiz.objects.create(lesson=lesson, title='Q', description='D')
        questions = [{'question_text': f'Q{i}', 'choices': ['A', 'B'], 'correct_answer': 'A'}
                     for i in range(101)]
        resp = teacher_client.post(
            f'/api/learning/quizzes/{quiz.id}/questions/bulk/', {'questions': questions}, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_bulk_questions_success(self, teacher_client, teacher):
        topic = _make_topic(created_by=teacher)
        lesson = Lesson.objects.create(topic=topic, title='L', content='C')
        quiz = Quiz.objects.create(lesson=lesson, title='Q', description='D')
        questions = [{'question_text': f'Q{i}', 'choices': ['A', 'B'], 'correct_answer': 'A'}
                     for i in range(3)]
        resp = teacher_client.post(
            f'/api/learning/quizzes/{quiz.id}/questions/bulk/', {'questions': questions}, format='json')
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data['created'] == 3

    def test_students_cannot_author(self, student_client):
        resp = student_client.post('/api/learning/topics/', {'name': 'N', 'description': 'D'}, format='json')
        assert resp.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestQuestionsVisibility:
    def test_student_list_questions_hides_correct_answer(self, student_client, teacher):
        topic = _make_topic(created_by=teacher)
        lesson = Lesson.objects.create(topic=topic, title='L', content='C')
        quiz = Quiz.objects.create(lesson=lesson, title='Q', description='D')
        Question.objects.create(quiz=quiz, question_text='Q', choices=['A', 'B'], correct_answer='A')
        resp = student_client.get(f'/api/learning/quizzes/{quiz.id}/questions/')
        assert resp.status_code == status.HTTP_200_OK
        assert 'correct_answer' not in resp.data['results'][0]

    def test_teacher_sees_correct_answer(self, teacher_client, teacher):
        topic = _make_topic(created_by=teacher)
        lesson = Lesson.objects.create(topic=topic, title='L', content='C')
        quiz = Quiz.objects.create(lesson=lesson, title='Q', description='D')
        Question.objects.create(quiz=quiz, question_text='Q', choices=['A', 'B'], correct_answer='A')
        resp = teacher_client.get(f'/api/learning/quizzes/{quiz.id}/questions/')
        assert 'correct_answer' in resp.data['results'][0]


@pytest.mark.django_db
class TestAttempts:
    def _quiz_with_questions(self, teacher):
        topic = _make_topic(created_by=teacher)
        lesson = Lesson.objects.create(topic=topic, title='L', content='C')
        quiz = Quiz.objects.create(lesson=lesson, title='Q', description='D')
        q1 = Question.objects.create(quiz=quiz, question_text='1+1?', choices=['2', '3'], correct_answer='2')
        q2 = Question.objects.create(quiz=quiz, question_text='2+2?', choices=['4', '5'], correct_answer='4')
        return quiz, q1, q2

    def test_attempt_requires_student_role(self, teacher_client, teacher):
        quiz, q1, _ = self._quiz_with_questions(teacher)
        resp = teacher_client.post(f'/api/learning/quizzes/{quiz.id}/attempts/', {
            'answers': [{'question': q1.id, 'answer': '2'}],
        }, format='json')
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_attempt_scoring(self, student_client):
        teacher_user = None
        from django.contrib.auth import get_user_model
        teacher_user = get_user_model().objects.create_user(
            username='tt', password='Str0ngPass!', role='teacher')
        quiz, q1, q2 = self._quiz_with_questions(teacher_user)
        resp = student_client.post(f'/api/learning/quizzes/{quiz.id}/attempts/', {
            'answers': [
                {'question': q1.id, 'answer': '2'},
                {'question': q2.id, 'answer': '5'},  # wrong
            ],
        }, format='json')
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data['score'] == 50.0

    def test_attempt_rejects_non_list_answers(self, student_client, db):
        from learning.models import Quiz, Lesson, Topic
        from django.contrib.auth import get_user_model
        teacher = get_user_model().objects.create_user(username='tz9', password='Str0ngPass!', role='teacher')
        topic = Topic.objects.create(name='TZ', description='D')
        lesson = Lesson.objects.create(topic=topic, title='L', content='C')
        quiz = Quiz.objects.create(lesson=lesson, title='Q', description='D')
        resp = student_client.post(f'/api/learning/quizzes/{quiz.id}/attempts/', {'answers': 'nope'}, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_performance_scoped_to_self(self, student_client, student, db, django_user_model):
        other = django_user_model.objects.create_user(username='s9', password='Str0ngPass!', role='student')
        teacher_user = django_user_model.objects.create_user(
            username='tt2', password='Str0ngPass!', role='teacher')
        quiz, q1, _ = self._quiz_with_questions(teacher_user)
        Attempt.objects.create(student=student, quiz=quiz, score=80)
        Attempt.objects.create(student=other, quiz=quiz, score=10)
        resp = student_client.get('/api/learning/performance/')
        scores = [row['score'] for row in resp.data]
        assert scores == [80]
