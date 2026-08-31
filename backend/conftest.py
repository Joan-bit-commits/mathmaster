import pytest

from accounts.models import User


@pytest.fixture
def student(db):
    return User.objects.create_user(
        username='student1', email='s1@example.com', password='Passw0rd!', role='student'
    )


@pytest.fixture
def teacher(db):
    return User.objects.create_user(
        username='teacher1', email='t1@example.com', password='Passw0rd!', role='teacher'
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username='admin1', email='a1@example.com', password='Passw0rd!', role='admin', is_superuser=True
    )


@pytest.fixture
def student_client(client, student):
    client.force_login(student)
    client.defaults['HTTP_AUTHORIZATION'] = ''  # DRF uses JWT, but tests use session client
    from rest_framework.test import APIClient

    api = APIClient()
    api.force_authenticate(user=student)
    return api


@pytest.fixture
def teacher_client(teacher):
    from rest_framework.test import APIClient

    api = APIClient()
    api.force_authenticate(user=teacher)
    return api


@pytest.fixture
def admin_client(admin_user):
    from rest_framework.test import APIClient

    api = APIClient()
    api.force_authenticate(user=admin_user)
    return api


@pytest.fixture
def anon_client():
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture(autouse=True)
def _disable_ratelimit(settings):
    # Register/login are rate-limited 5/min per IP, which breaks test runs.
    settings.RATELIMIT_ENABLE = False
