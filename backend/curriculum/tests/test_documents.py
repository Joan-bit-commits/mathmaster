from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from accounts.models import User
from curriculum.models import Document, DocumentChunk
from curriculum.services import chunk_text


class DocumentTests(TestCase):
    def test_chunks_are_created_from_text(self):
        user = User.objects.create_user(username='owner', password='StrongPass1!')
        document = Document.objects.create(
            owner=user, title='Notes', file=SimpleUploadedFile('notes.pdf', b'%PDF'), file_size=4
        )
        DocumentChunk.objects.bulk_create(
            [
                DocumentChunk(document=document, **item)
                for item in chunk_text('A paragraph about linear equations.')
            ]
        )
        self.assertEqual(document.chunks.count(), 1)
        document.delete()
        self.assertEqual(DocumentChunk.objects.count(), 0)
