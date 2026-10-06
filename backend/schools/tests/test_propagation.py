from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile


@pytest.mark.django_db
def test_ai_tutor_session_and_messages_keep_request_school(student, request_factory):
    from ai_tutor.models import ChatMessage, ChatSession
    from ai_tutor.services import run_ask

    request = request_factory.post('/')
    request.user = student
    request.school = student.current_school
    request.data = {}
    with (
        patch('ai_tutor.services.gemini_configured', return_value=True),
        patch('ai_tutor.services.ask_gemini', return_value='x = 3'),
    ):
        payload, status_code, _ = run_ask(
            request, {'topic': 'Algebra', 'question': 'What is x + 2 = 5?', 'level': 'S1'}
        )

    session = ChatSession.objects.get(id=payload['session_id'])
    assert status_code == 200
    assert session.school == request.school
    assert set(ChatMessage.objects.filter(session=session).values_list('school_id', flat=True)) == {
        request.school.id
    }


@pytest.mark.django_db
def test_recommendations_are_created_in_the_request_school(student, school):
    from analytics.services import generate_recommendations
    from learning.models import Attempt, Lesson, Quiz, Topic

    topic = Topic.objects.create(
        school=school, name='Propagation Algebra', description='', created_by=student
    )
    lesson = Lesson.objects.create(school=school, topic=topic, title='Linear', content='x')
    quiz = Quiz.objects.create(school=school, lesson=lesson, title='Linear quiz', description='')
    Attempt.objects.create(school=school, student=student, quiz=quiz, score=10)

    recommendations = generate_recommendations(student, school=school)

    assert recommendations
    assert all(recommendation.school_id == school.id for recommendation in recommendations)


@pytest.mark.django_db
def test_document_chunks_and_chat_records_keep_document_school(student, school):
    from curriculum.models import Document, DocumentChatSession, DocumentChunk, DocumentQuestion
    from curriculum.services import answer_document, process_document

    document = Document.objects.create(
        owner=student,
        school=school,
        title='Propagation Notes',
        file=SimpleUploadedFile('notes.pdf', b'%PDF-1.4', content_type='application/pdf'),
        file_size=8,
    )
    with (
        patch('curriculum.services.extract_pages', return_value=[(1, 'Linear equations and x.')]),
        patch('curriculum.services.gemini_configured', return_value=False),
    ):
        process_document(document)

    document.refresh_from_db()
    assert DocumentChunk.objects.filter(document=document, school=school).exists()
    with patch('curriculum.services.ask_gemini', return_value='x = 1'):
        record, _ = answer_document(document, 'How do I solve for x?', student)
    assert record.school_id == school.id
    assert DocumentChatSession.objects.get(id=record.session_id).school_id == school.id
    assert DocumentQuestion.objects.get(id=record.id).school_id == school.id
