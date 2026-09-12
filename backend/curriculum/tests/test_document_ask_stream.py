from unittest import mock

import pytest

from curriculum.models import Document, DocumentChatSession, DocumentChunk


@pytest.mark.django_db
class TestDocumentAskStream:
    """Fix 1: /ask/stream/ must actually emit SSE frames the mobile client's
    askDocumentStream() can parse (`data: {"token": ...}` and a final
    `event: done` frame with session_id) — the old /ask/ endpoint returned a
    single JSON body that the client's SSE reader could never make sense of."""

    def _make_document(self, student):
        document = Document.objects.create(owner=student, title='Notes', file_size=4)
        DocumentChunk.objects.create(
            document=document, chunk_index=0, page_number=3,
            content='To solve 2x + 5 = 13, subtract 5 then divide by 2 to get x = 4.',
            token_count=15,
        )
        return document

    def test_requires_auth(self, anon_client, student):
        document = self._make_document(student)
        resp = anon_client.post(
            f'/api/documents/{document.id}/ask/stream/',
            {'question': 'How do I solve 2x+5=13?'},
            format='json',
            HTTP_ACCEPT='text/event-stream',
        )
        # This 401 response has to render through ServerSentEventRenderer
        # (it's request.accepted_renderer by this point) rather than the
        # normal JSON renderer — a renderer with charset=None blows up here
        # with "renderer returned unicode, and did not specify a charset
        # value" instead of cleanly returning 401.
        assert resp.status_code == 401

    def test_does_not_406_when_client_sends_the_real_sse_accept_header(self, student_client, student):
        """Regression guard for the exact bug reported: DRF's content
        negotiation rejects a streaming view with 406 before post() ever
        runs if the view's renderer_classes don't declare
        text/event-stream. Earlier tests in this file never sent the
        Accept header the mobile client actually sends, so they passed
        even while real requests were 406ing."""
        document = self._make_document(student)
        with mock.patch('curriculum.services.gemini_configured', return_value=False):
            resp = student_client.post(
                f'/api/documents/{document.id}/ask/stream/',
                {'question': 'How do I solve 2x+5=13?'},
                format='json',
                HTTP_ACCEPT='text/event-stream',
            )
            b''.join(resp.streaming_content)
        assert resp.status_code != 406

    def test_streams_sse_frames_and_persists_the_answer(self, student_client, student):
        document = self._make_document(student)

        with mock.patch('curriculum.services.gemini_configured', return_value=False):
            resp = student_client.post(
                f'/api/documents/{document.id}/ask/stream/',
                {'question': 'How do I solve 2x+5=13?'},
                format='json',
                HTTP_ACCEPT='text/event-stream',
            )

        assert resp.status_code == 200
        assert resp['Content-Type'] == 'text/event-stream'
        body = b''.join(resp.streaming_content).decode()

        assert 'data: {"token"' in body
        assert 'event: done' in body
        assert '"page": 3' in body  # real page_number, not "Page ?"

        session = DocumentChatSession.objects.get(document=document, user=student)
        assert session.messages.count() == 1

    def test_reuses_session_id_passed_by_the_client(self, student_client, student):
        document = self._make_document(student)
        existing_session = DocumentChatSession.objects.create(document=document, user=student)

        with mock.patch('curriculum.services.gemini_configured', return_value=False):
            resp = student_client.post(
                f'/api/documents/{document.id}/ask/stream/',
                {'question': 'Another question', 'session_id': existing_session.id},
                format='json',
                HTTP_ACCEPT='text/event-stream',
            )

        body = b''.join(resp.streaming_content).decode()
        assert f'"session_id": {existing_session.id}' in body
        assert DocumentChatSession.objects.filter(document=document).count() == 1
