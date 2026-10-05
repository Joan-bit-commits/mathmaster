"""Strict math mode + GeoGebra 2D/3D tests.

Covers: refusal detection, [GEOGEBRA_DATA] extraction/validation on both
paths, and the SSE event contract (token / geogebra / done).
"""
import json
from unittest import mock

import pytest
from django.core.cache import cache

from ai_tutor.models import ChatMessage, ChatSession

GEOGEBRA_2D = (
    '\n[GEOGEBRA_DATA: {"view": "2D", "title": "y = x^2", '
    '"commands": ["f(x) = x^2"], "axes": true, "grid": true, '
    '"x_min": -5, "x_max": 5, "y_min": -2, "y_max": 10}]'
)

GEOGEBRA_3D = (
    '\n[GEOGEBRA_DATA: {"view": "3D", "title": "Sphere r=3", '
    '"commands": ["Sphere((0,0,0), 3)"], "x_label": "x", "y_label": "y", "z_label": "z"}]'
)

REFUSAL = (
    "I'm sorry, but I can only help with mathematics. If you have a math "
    "problem — algebra, geometry, trigonometry, calculus, statistics, or "
    "any other math topic — I'd be happy to help. Please ask me a math question."
)


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
    with mock.patch('ai_tutor.services.ask_gemini', return_value='# Concept\n\nAnswer.' + GEOGEBRA_2D) as m:
        yield m


def _post(client, **overrides):
    payload = {'topic': 'Algebra', 'question': 'Graph y = x^2'}
    payload.update(overrides)
    return client.post('/api/ai-tutor/ask-ai-tutor/', payload, format='json')


def _stream(client, chunks=('# Concept\n\nAnswer.', GEOGEBRA_2D), **overrides):
    payload = {'topic': 'Algebra', 'question': 'Graph y = x^2'}
    payload.update(overrides)
    with (
        mock.patch('ai_tutor.services.stream_gemini', return_value=iter(list(chunks))),
        mock.patch('ai_tutor.services.gemini_configured', return_value=True),
    ):
        resp = client.post(
            '/api/ai-tutor/ask-ai-tutor/stream/',
            payload,
            format='json',
            HTTP_ACCEPT='text/event-stream',
        )
        assert resp.status_code == 200
        body = b''.join(resp.streaming_content).decode()
    return body


@pytest.mark.django_db
class TestStrictModeNonStreaming:
    def test_off_topic_returns_refusal(self, student_client):
        with mock.patch(
            'ai_tutor.services.ask_gemini', return_value=REFUSAL
        ):
            resp = _post(student_client, question='Tell me a joke')
        assert resp.status_code == 200
        assert resp.data['is_refusal'] is True
        assert resp.data['geogebra'] is None
        assert resp.data['answer'] == REFUSAL

    def test_math_answer_has_geogebra_payload(self, student_client, gemini_mock):
        resp = _post(student_client)
        assert resp.status_code == 200
        assert resp.data['is_refusal'] is False
        geo = resp.data['geogebra']
        assert geo is not None
        assert geo['view'] == '2D'
        assert geo['commands'] == ['f(x) = x^2']
        assert geo['x_min'] == -5 and geo['x_max'] == 5
        # visible answer must not contain the raw tag
        assert 'GEOGEBRA_DATA' not in resp.data['answer']

    def test_invalid_geogebra_json_is_stripped(self, student_client):
        with mock.patch(
            'ai_tutor.services.ask_gemini',
            return_value='# Concept\n\nAnswer.\n[GEOGEBRA_DATA: {broken json!!}]',
        ):
            resp = _post(student_client)
        assert resp.data['geogebra'] is None
        assert 'GEOGEBRA_DATA' not in resp.data['answer']
        assert 'Answer.' in resp.data['answer']

    def test_unknown_view_rejected(self, student_client):
        with mock.patch(
            'ai_tutor.services.ask_gemini',
            return_value='Answer.\n[GEOGEBRA_DATA: {"view": "4D", "title": "t", "commands": ["f(x)=x^2"]}]',
        ):
            resp = _post(student_client)
        assert resp.data['geogebra'] is None

    def test_dangerous_command_rejected(self, student_client):
        with mock.patch(
            'ai_tutor.services.ask_gemini',
            return_value='Answer.\n[GEOGEBRA_DATA: {"view": "2D", "title": "t", "commands": ["eval(1+1)"]}]',
        ):
            resp = _post(student_client)
        assert resp.data['geogebra'] is None

    def test_payload_shape_matches_contract(self, student_client, gemini_mock):
        resp = _post(student_client)
        assert set(resp.data.keys()) == {
            'session_id', 'topic', 'level', 'answer', 'geogebra', 'cached', 'is_refusal'
        }


@pytest.mark.django_db
class TestStrictModeStreaming:
    def test_stream_emits_geogebra_event_before_done(self, student_client):
        body = _stream(student_client)
        events = [b.split('\n')[0] for b in body.split('\n\n') if b.strip()]
        assert events[0] == 'data: {"token"' or events[0].startswith('data:')
        assert 'event: geogebra' in body
        # geogebra event must come before done
        assert body.index('event: geogebra') < body.index('event: done')

    def test_stream_refusal_has_no_geogebra_event(self, student_client):
        body = _stream(student_client, question='Tell me a joke', chunks=[REFUSAL])
        assert 'event: geogebra' not in body
        done = next(line for line in body.split('\n\n') if line.startswith('event: done'))
        assert json.loads(done.split('data: ', 1)[1])['is_refusal'] is True

    def test_stream_done_includes_is_refusal_and_geogebra(self, student_client):
        body = _stream(student_client)
        done = next(line for line in body.split('\n\n') if line.startswith('event: done'))
        data = json.loads(done.split('data: ', 1)[1])
        assert data['is_refusal'] is False
        assert data['geogebra'] == json.loads(
            '{"view": "2D", "title": "y = x^2", "commands": ["f(x) = x^2"], "axes": true, "grid": true, "x_min": -5, "x_max": 5, "y_min": -2, "y_max": 10}'
        )


@pytest.mark.django_db
class TestSessionDetailContract:
    def test_detail_messages_include_geogebra_and_is_refusal(self, student_client, student):
        session = ChatSession.objects.create(
            student=student, school=student.current_school, topic='Algebra'
        )
        ChatMessage.objects.create(session=session, school=session.school, role='user', content='Graph y=x^2')
        ChatMessage.objects.create(
            session=session, school=session.school, role='assistant', content='# Answer.\n' + GEOGEBRA_3D
        )
        ChatMessage.objects.create(session=session, school=session.school, role='user', content='Tell me a joke')
        ChatMessage.objects.create(session=session, school=session.school, role='assistant', content=REFUSAL)

        resp = student_client.get(f'/api/ai-tutor/sessions/{session.id}/')
        assert resp.status_code == 200
        messages = resp.data['messages']
        assert messages[1]['geogebra']['view'] == '3D'
        assert messages[1]['is_refusal'] is False
        assert 'GEOGEBRA_DATA' not in messages[1]['content']
        assert messages[3]['is_refusal'] is True
        assert messages[3]['geogebra'] is None
