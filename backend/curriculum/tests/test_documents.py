from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from memberships.models import Membership
from schools.models import School
from curriculum.models import Document, DocumentChatSession, DocumentChunk
from curriculum.services import (
    _resolve_document_session,
    answer_document,
    chunk_pages,
    chunk_text,
)


class DocumentTests(TestCase):
    def test_chunks_are_created_from_text(self):
        user = User.objects.create_user(username='owner', password='StrongPass1!')
        school = School.objects.create(name='Chunk School', slug='chunk-school', contact_email='owner@example.com', created_by=user)
        Membership.objects.create(user=user, school=school, role='owner')
        document = Document.objects.create(
            owner=user, school=school, title='Notes', file=SimpleUploadedFile('notes.pdf', b'%PDF'), file_size=4
        )
        DocumentChunk.objects.bulk_create(
            [
                DocumentChunk(document=document, school=school, **item)
                for item in chunk_text('A paragraph about linear equations.')
            ]
        )
        self.assertEqual(document.chunks.count(), 1)
        document.delete()
        self.assertEqual(DocumentChunk.objects.count(), 0)


class ChunkPagesTests(TestCase):
    """Fix 4: chunks must carry the real page_number they came from."""

    def test_each_chunk_carries_its_source_page_number(self):
        pages = [
            (1, 'Introduction to algebra. Solve for x in each equation.'),
            (2, 'Worked example: 2x + 5 = 13, so x = 4.'),
        ]
        chunks = chunk_pages(pages)
        self.assertEqual([c['page_number'] for c in chunks], [1, 2])
        # chunk_index must be sequential across the whole document, not
        # restarted per page.
        self.assertEqual([c['chunk_index'] for c in chunks], [0, 1])

    def test_blank_pages_are_skipped_without_breaking_indexing(self):
        pages = [(1, 'Some real content here.'), (2, ''), (3, 'More content on page three.')]
        chunks = chunk_pages(pages)
        self.assertEqual([c['page_number'] for c in chunks], [1, 3])
        self.assertEqual([c['chunk_index'] for c in chunks], [0, 1])


class DocumentSessionContinuityTests(TestCase):
    """Fix 3: a supplied session_id should be reused, not silently dropped."""

    def setUp(self):
        self.user = User.objects.create_user(username='student1', password='StrongPass1!')
        self.other_user = User.objects.create_user(username='student2', password='StrongPass1!')
        self.school = School.objects.create(name='Document School', slug='document-school', contact_email='owner@example.com', created_by=self.user)
        Membership.objects.create(user=self.user, school=self.school, role='owner')
        Membership.objects.create(user=self.other_user, school=self.school, role='student')
        self.user.current_school = self.school
        self.user.save(update_fields=['current_school'])
        self.other_user.current_school = self.school
        self.other_user.save(update_fields=['current_school'])
        self.document = Document.objects.create(
            owner=self.user, school=self.school, title='Notes', file=SimpleUploadedFile('notes.pdf', b'%PDF'), file_size=4
        )
        DocumentChunk.objects.create(
            document=self.document, school=self.school, chunk_index=0, page_number=1,
            content='Linear equations: isolate x by doing the same operation on both sides.',
            token_count=12,
        )

    def test_existing_session_is_reused(self):
        session = DocumentChatSession.objects.create(document=self.document, school=self.school, user=self.user)
        resolved = _resolve_document_session(self.document, self.user, session.id)
        self.assertEqual(resolved.id, session.id)

    def test_session_detail_uses_session_id_url_parameter(self):
        session = DocumentChatSession.objects.create(document=self.document, school=self.school, user=self.user)
        client = APIClient()
        client.force_authenticate(user=self.user)

        response = client.get(f'/api/documents/{self.document.id}/sessions/{session.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], session.id)

    def test_unknown_session_id_creates_a_new_session_instead_of_erroring(self):
        resolved = _resolve_document_session(self.document, self.user, 999999, question='hi')
        self.assertIsNotNone(resolved.id)

    def test_session_owned_by_another_user_is_not_reused(self):
        foreign_session = DocumentChatSession.objects.create(document=self.document, school=self.school, user=self.other_user)
        resolved = _resolve_document_session(self.document, self.user, foreign_session.id)
        self.assertNotEqual(resolved.id, foreign_session.id)

    @patch('curriculum.services.gemini_configured', return_value=False)
    def test_answer_document_reuses_session_across_two_questions(self, _mock):
        record1, _ = answer_document(self.document, 'How do I solve linear equations?', self.user)
        record2, _ = answer_document(
            self.document, 'Can you show another example?', self.user, session_id=record1.session_id
        )
        self.assertEqual(record1.session_id, record2.session_id)
        self.assertEqual(DocumentChatSession.objects.filter(document=self.document).count(), 1)
