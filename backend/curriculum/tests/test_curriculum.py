from django.urls import reverse
from rest_framework.test import APITestCase

from accounts.models import User
from curriculum.services import chunk_text
from curriculum.structure import format_curriculum_context, get_objective, search_objectives


class CurriculumTests(APITestCase):
    def setUp(self):
        self.client.force_authenticate(User.objects.create_user(username='student', password='StrongPass1!'))

    def test_objective_lookup_and_search(self):
        objective = get_objective('S1.M.A.1')
        self.assertEqual(objective['level'], 'S1')
        self.assertTrue(search_objectives('linear equations'))

    def test_context_contains_local_conventions(self):
        context = format_curriculum_context(code='S1.M.A.1')
        self.assertIn('shs.', context)
        self.assertIn('HCF', context)
        self.assertIn('S1.M.A.1', context)

    def test_chunk_text_splits_and_overlaps(self):
        chunks = chunk_text('\n\n'.join(f'Paragraph {i} words' for i in range(10)), chunk_size=5, overlap=2)
        self.assertGreater(len(chunks), 1)
        self.assertEqual(chunks[0]['chunk_index'], 0)

    def test_levels_endpoint_returns_all_levels(self):
        response = self.client.get(reverse('curriculum-levels'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 8)
