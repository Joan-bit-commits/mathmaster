"""Student accounts can't create or manage schools."""
import pytest
from rest_framework.test import APIClient

from accounts.models import User
from invitations.models import Invitation
from memberships.models import Membership
from schools.models import ClassCode, School
from schools.signals import _personal_school

SCHOOL_PAYLOAD = {
    'name': 'New School',
    'slug': 'new-school',
    'contact_email': 'x@example.com',
    'school_type': 'secondary',
}


def _client(user, school=None):
    client = APIClient()
    client.force_authenticate(user=user)
    if school is not None:
        client.credentials(HTTP_X_SCHOOL_ID=str(school.id))
    return client


@pytest.fixture
def school(db):
    creator = User.objects.create_user(username='creator', email='c@t.com', password='Pass1234!', role='teacher')
    return School.objects.create(name='Main', slug='main', contact_email='m@t.com', created_by=creator)


@pytest.fixture
def student(db):
    return User.objects.create_user(username='stu', email='stu@t.com', password='Pass1234!', role='student')


@pytest.fixture
def teacher(db):
    return User.objects.create_user(username='tea', email='tea@t.com', password='Pass1234!', role='teacher')


@pytest.mark.django_db
class TestCreateSchool:
    def test_student_cannot_create(self, student):
        res = _client(student).post('/api/schools/', SCHOOL_PAYLOAD, format='json')
        assert res.status_code == 403
        assert not School.objects.filter(slug='new-school').exists()

    def test_teacher_can_create_and_owns_it(self, teacher):
        res = _client(teacher).post('/api/schools/', SCHOOL_PAYLOAD, format='json')
        assert res.status_code == 201
        assert Membership.objects.get(user=teacher, school__slug='new-school').role == 'owner'


@pytest.mark.django_db
class TestManageSchool:
    def test_student_with_stale_owner_membership_cannot_edit_or_delete(self, student, school):
        Membership.objects.create(user=student, school=school, role='owner')
        client = _client(student, school)
        assert client.patch(f'/api/schools/{school.id}/', {'name': 'Hacked'}, format='json').status_code == 403
        assert client.delete(f'/api/schools/{school.id}/').status_code == 403
        school.refresh_from_db()
        assert school.name == 'Main'

    def test_student_with_stale_owner_membership_cannot_use_admin_endpoints(self, student, school):
        Membership.objects.create(user=student, school=school, role='owner')
        client = _client(student, school)
        assert client.get(f'/api/schools/{school.id}/class-code/').status_code == 403
        assert client.get(f'/api/schools/{school.id}/invitations/').status_code == 403

    def test_admin_of_one_school_cannot_edit_another_via_header(self, teacher, school):
        mine = School.objects.create(name='Mine', slug='mine', contact_email='a@t.com', created_by=teacher)
        Membership.objects.create(user=teacher, school=mine, role='owner')
        Membership.objects.create(user=teacher, school=school, role='student')
        res = _client(teacher, mine).patch(f'/api/schools/{school.id}/', {'name': 'Hacked'}, format='json')
        assert res.status_code == 403

    def test_owner_can_edit(self, teacher, school):
        Membership.objects.create(user=teacher, school=school, role='owner')
        res = _client(teacher, school).patch(f'/api/schools/{school.id}/', {'name': 'Renamed'}, format='json')
        assert res.status_code == 200

    def test_student_member_cannot_list_roster(self, student, school):
        Membership.objects.create(user=student, school=school, role='student')
        assert _client(student, school).get(f'/api/schools/{school.id}/members/').status_code == 403

    def test_teacher_member_can_list_roster(self, teacher, school):
        Membership.objects.create(user=teacher, school=school, role='teacher')
        assert _client(teacher, school).get(f'/api/schools/{school.id}/members/').status_code == 200


@pytest.mark.django_db
class TestJoinAndInvites:
    def _code(self, school, role):
        return ClassCode.objects.create(school=school, code=f'{role[:3].upper()}12345', target_role=role, created_by=school.created_by)

    def test_student_cannot_join_with_staff_code(self, student, school):
        self._code(school, 'teacher')
        res = _client(student).post('/api/schools/join-by-code/', {'code': 'TEA12345'}, format='json')
        assert res.status_code == 403
        assert not Membership.objects.filter(user=student, school=school).exists()

    def test_student_can_join_with_student_code(self, student, school):
        self._code(school, 'student')
        res = _client(student).post('/api/schools/join-by-code/', {'code': 'STU12345'}, format='json')
        assert res.status_code == 200
        assert Membership.objects.get(user=student, school=school).role == 'student'

    def test_student_registration_rejects_staff_invite(self, school):
        invite = Invitation.objects.create(
            school=school, email='n@t.com', role='admin', invited_by=school.created_by,
            expires_at='2999-01-01T00:00:00Z',
        )
        res = APIClient().post(
            '/api/accounts/register/',
            {'username': 'newbie', 'email': 'n@t.com', 'password': 'Str0ng!Passw0rd', 'password2': 'Str0ng!Passw0rd',
             'role': 'student', 'invite_token': invite.token},
            format='json',
        )
        assert res.status_code == 400
        assert not User.objects.filter(username='newbie').exists()


@pytest.mark.django_db
def test_personal_school_gives_students_no_ownership(student, teacher):
    assert Membership.objects.get(user=student, school=_personal_school(student)).role == 'student'
    assert Membership.objects.get(user=teacher, school=_personal_school(teacher)).role == 'owner'


@pytest.mark.django_db
class TestAdminReadEndpointsAreManagerOnly:
    @pytest.mark.parametrize('suffix', ['invitations/', 'audit-logs/', 'subscription/', 'invoices/', 'class-code/'])
    def test_student_member_is_denied(self, student, school, suffix):
        Membership.objects.create(user=student, school=school, role='student')
        assert _client(student, school).get(f'/api/schools/{school.id}/{suffix}').status_code == 403

    @pytest.mark.parametrize('suffix', ['invitations/', 'audit-logs/', 'subscription/', 'invoices/'])
    def test_outsider_is_denied(self, teacher, school, suffix):
        assert _client(teacher).get(f'/api/schools/{school.id}/{suffix}').status_code == 403

    def test_outsider_cannot_modify_a_class(self, teacher, school):
        from classes.models import SchoolClass

        cls = SchoolClass.objects.create(school=school, name='S1', level='S1')
        client = _client(teacher)
        assert client.patch(f'/api/schools/{school.id}/classes/{cls.id}/', {'name': 'x'}, format='json').status_code == 403
        assert client.delete(f'/api/schools/{school.id}/classes/{cls.id}/').status_code == 403

    def test_student_member_cannot_modify_a_class(self, student, school):
        from classes.models import SchoolClass

        Membership.objects.create(user=student, school=school, role='student')
        cls = SchoolClass.objects.create(school=school, name='S1', level='S1')
        client = _client(student, school)
        assert client.delete(f'/api/schools/{school.id}/classes/{cls.id}/').status_code == 403
        assert client.get(f'/api/schools/{school.id}/classes/{cls.id}/').status_code == 200
