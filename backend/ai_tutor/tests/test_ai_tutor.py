from unittest import mock

import pytest
from django.core.cache import cache

from ai_tutor.models import ChatMessage, ChatSession


@pytest.fixture(autouse=True)
def gemini_key(settings):
    settings.GENAI_API_KEY = 'test-key'


@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def gemini_mock():
    with mock.patch('ai_tutor.services.ask_gemini', return_value='Step 1: think. Answer: 4.') as m:
        yield m


@pytest.mark.django_db
class TestChatSessions:
    """Fix 2: GET /api/ai-tutor/sessions/ used to 404 — the route didn't
    exist at all, even though the mobile client's getSessions() called it."""

    def test_requires_auth(self, anon_client):
        resp = anon_client.get('/api/ai-tutor/sessions/')
        assert resp.status_code == 401

    def test_lists_only_the_current_users_sessions(self, student_client, student, teacher):
        mine = ChatSession.objects.create(student=student, topic='Algebra')
        ChatMessage.objects.create(session=mine, role='user', content='What is 2x=8?')
        ChatMessage.objects.create(session=mine, role='assistant', content='x = 4')
        ChatSession.objects.create(student=teacher, topic='Geometry')

        resp = student_client.get('/api/ai-tutor/sessions/')
        assert resp.status_code == 200
        results = resp.data['results']
        ids = [item['id'] for item in results]
        assert ids == [mine.id]
        assert results[0]['message_count'] == 2
        assert results[0]['title'] == 'What is 2x=8?'

    def test_detail_view_includes_messages_and_is_scoped_to_owner(self, student_client, student, teacher):
        mine = ChatSession.objects.create(student=student, topic='Algebra')
        ChatMessage.objects.create(session=mine, role='user', content='Hi')
        others = ChatSession.objects.create(student=teacher, topic='Geometry')

        resp = student_client.get(f'/api/ai-tutor/sessions/{mine.id}/')
        assert resp.status_code == 200
        assert len(resp.data['messages']) == 1

        resp = student_client.get(f'/api/ai-tutor/sessions/{others.id}/')
        assert resp.status_code == 404


@pytest.mark.django_db
class TestAITutorAsk:
    def _ask(self, client, **overrides):
        payload = {'topic': 'Algebra', 'question': 'What is 2+2?'}
        payload.update(overrides)
        return client.post('/api/ai-tutor/ask-ai-tutor/', payload, format='json')

    def test_requires_auth(self, anon_client):
        resp = anon_client.post(
            '/api/ai-tutor/ask-ai-tutor/', {'topic': 'Algebra', 'question': 'Q'}, format='json'
        )
        assert resp.status_code == 401

    def test_basic_answer(self, student_client, gemini_mock):
        resp = self._ask(student_client)
        assert resp.status_code == 200
        assert 'answer' in resp.data
        assert 'session_id' in resp.data

    def test_messages_persisted(self, student_client, gemini_mock, student):
        resp = self._ask(student_client)
        session_id = resp.data['session_id']
        assert ChatSession.objects.filter(id=session_id, student=student).exists()
        roles = list(ChatMessage.objects.filter(session_id=session_id).values_list('role', flat=True))
        assert roles == ['user', 'assistant']

    def test_history_passed_to_gemini(self, student_client, gemini_mock):
        first = self._ask(student_client)
        session_id = first.data['session_id']
        ChatMessage.objects.create(session_id=session_id, role='user', content='previous question')
        ChatMessage.objects.create(session_id=session_id, role='assistant', content='previous answer')
        self._ask(student_client, session_id=session_id, question='Why?')
        args, kwargs = gemini_mock.call_args
        history = kwargs.get('history') or (args[1] if len(args) > 1 else [])
        assert len(history) >= 2

    def test_cache_hit(self, student_client, gemini_mock):
        self._ask(student_client)
        self._ask(student_client)
        assert gemini_mock.call_count == 1  # second was served from cache

    def test_invalid_session_id_creates_new(self, student_client, gemini_mock):
        resp = self._ask(student_client, session_id=99999)
        assert resp.status_code == 200
        assert resp.data['session_id'] != 99999

    def test_gemini_failure_returns_503(self, student_client):
        with mock.patch('ai_tutor.services.ask_gemini', side_effect=RuntimeError('boom')):
            resp = self._ask(student_client)
        assert resp.status_code == 503
        assert resp.data['error']['code'] == 'SERVICE_UNAVAILABLE'

    def test_unconfigured_key_returns_503(self, student_client, settings):
        settings.GENAI_API_KEY = ''
        settings.DEBUG = False
        resp = self._ask(student_client)
        assert resp.status_code == 503


@pytest.mark.django_db
class TestAITutorStream:
    def test_stream_sse_events(self, student_client):
        with (
            mock.patch('ai_tutor.services.stream_gemini') as sg,
            mock.patch('ai_tutor.services.gemini_configured', return_value=True),
        ):
            sg.return_value = iter(['Step ', '1: answer'])
            resp = student_client.post(
                '/api/ai-tutor/ask-ai-tutor/stream/',
                {
                    'topic': 'Algebra',
                    'question': 'What is 2+2?',
                },
                format='json',
            )
            assert resp.status_code == 200
            assert resp['Content-Type'] == 'text/event-stream'
            # consume the stream while the mock is still active (generators are lazy)
            body = b''.join(resp.streaming_content).decode()
        assert '"token"' in body
        assert 'event: done' in body

    def test_stream_error_is_sse_not_500(self, student_client):
        with (
            mock.patch('ai_tutor.services.stream_gemini', side_effect=RuntimeError('boom')),
            mock.patch('ai_tutor.services.gemini_configured', return_value=True),
        ):
            resp = student_client.post(
                '/api/ai-tutor/ask-ai-tutor/stream/',
                {
                    'topic': 'Algebra',
                    'question': 'Q?',
                },
                format='json',
            )
            body = b''.join(resp.streaming_content).decode()
        assert resp.status_code == 200  # SSE errors are in-band
        assert 'event: error' in body

    def test_stream_saves_messages(self, student_client, student):
        with (
            mock.patch('ai_tutor.services.stream_gemini', return_value=iter(['answer text'])),
            mock.patch('ai_tutor.services.gemini_configured', return_value=True),
        ):
            resp = student_client.post(
                '/api/ai-tutor/ask-ai-tutor/stream/',
                {
                    'topic': 'Algebra',
                    'question': 'Q?',
                },
                format='json',
            )
            body = b''.join(resp.streaming_content).decode()
        assert ChatMessage.objects.filter(role='assistant', content='answer text').exists()
        assert 'session_id' in body
