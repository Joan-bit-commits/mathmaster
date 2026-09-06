import pytest
from rest_framework import status

from ai_tutor.models import ChatMessage, ChatSession


@pytest.mark.django_db
class TestChatSessions:
    def _make_session(self, user, topic='Algebra', title='Test chat'):
        session = ChatSession.objects.create(student=user, topic=topic, title=title)
        ChatMessage.objects.create(session=session, role='user', content='Hello')
        ChatMessage.objects.create(session=session, role='assistant', content='Hi there!')
        return session

    def test_list_sessions_empty(self, student_client):
        response = student_client.get('/api/ai-tutor/sessions/')
        assert response.status_code == status.HTTP_200_OK
        data = response.data
        sessions = data.get('results', data)
        assert sessions == []

    def test_list_sessions_returns_users_sessions(self, student_client, student):
        self._make_session(student, topic='Algebra')
        self._make_session(student, topic='Geometry')

        response = student_client.get('/api/ai-tutor/sessions/')

        assert response.status_code == status.HTTP_200_OK
        data = response.data
        sessions = data.get('results', data)
        assert len(sessions) == 2
        assert {session['topic'] for session in sessions} == {'Algebra', 'Geometry'}

    def test_session_detail_returns_messages(self, student_client, student):
        session = self._make_session(student, topic='Algebra')

        response = student_client.get(f'/api/ai-tutor/sessions/{session.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['topic'] == 'Algebra'
        assert len(response.data['messages']) == 2
        assert response.data['messages'][0]['role'] == 'user'

    def test_cannot_see_other_users_sessions(self, student_client, teacher):
        session = ChatSession.objects.create(student=teacher, topic='Algebra')

        response = student_client.get(f'/api/ai-tutor/sessions/{session.id}/')

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_session(self, student_client, student):
        session = self._make_session(student)

        response = student_client.delete(f'/api/ai-tutor/sessions/{session.id}/')

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not ChatSession.objects.filter(id=session.id).exists()

    def test_unauthenticated_cannot_list_sessions(self, anon_client):
        response = anon_client.get('/api/ai-tutor/sessions/')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
