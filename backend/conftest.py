import pytest

from accounts.models import User
from memberships.models import Membership
from schools.models import School


def _attach_school(user, slug):
    school = School.objects.create(
        name=f'{user.username} School',
        slug=slug,
        contact_email=user.email,
        created_by=user,
    )
    Membership.objects.create(user=user, school=school, role='owner')
    user.current_school = school
    user.save(update_fields=['current_school'])
    return user


@pytest.fixture
def student(db):
    return _attach_school(User.objects.create_user(
        username='student1', email='s1@example.com', password='Passw0rd!', role='student'
    ), 'student-school')


@pytest.fixture
def teacher(db):
    return _attach_school(User.objects.create_user(
        username='teacher1', email='t1@example.com', password='Passw0rd!', role='teacher'
    ), 'teacher-school')


@pytest.fixture
def admin_user(db):
    return _attach_school(User.objects.create_user(
        username='admin1', email='a1@example.com', password='Passw0rd!', role='admin', is_superuser=True
    ), 'admin-school')


@pytest.fixture
def school(student):
    return student.current_school


@pytest.fixture
def request_factory():
    from rest_framework.test import APIRequestFactory

    return APIRequestFactory()


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
def _disable_ratelimit(settings, tmp_path):
    # Register/login are rate-limited 5/min per IP, which breaks test runs.
    settings.RATELIMIT_ENABLE = False
    settings.MEDIA_ROOT = tmp_path
