from unittest.mock import patch
from base64 import b64decode

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase

from accounts.models import User
from curriculum.models import ScanJob
from curriculum.tasks import solve_scan_task


JPEG_BYTES = b64decode(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AX//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Aqf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z'
)


class ScanTaskTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='scan-task-user', password='StrongPass1!')
        self.client.force_authenticate(self.user)

    @patch('curriculum.views.solve_scan_task.delay')
    def test_scan_endpoint_dispatches_task_and_returns_pending_job(self, mock_delay):
        response = self.client.post(
            reverse('scan-solve'),
            {'image': SimpleUploadedFile('problem.jpg', JPEG_BYTES, content_type='image/jpeg')},
            format='multipart',
        )

        self.assertEqual(response.status_code, 201)
        scan = ScanJob.objects.get()
        mock_delay.assert_called_once_with(scan.id)
        self.assertEqual(response.data['id'], scan.id)
        self.assertEqual(response.data['status'], ScanJob.ScanStatus.PENDING)

    @patch('curriculum.services.solve_scanned_problem', side_effect=RuntimeError('Gemini unavailable'))
    def test_eager_task_records_failure(self, _mock_solver):
        scan = ScanJob.objects.create(
            user=self.user,
            image=SimpleUploadedFile('problem.jpg', b'jpeg', content_type='image/jpeg'),
        )

        solve_scan_task.apply(args=[scan.id], throw=True)

        scan.refresh_from_db()
        self.assertEqual(scan.status, ScanJob.ScanStatus.FAILED)
        self.assertEqual(scan.error_message, 'Gemini unavailable')