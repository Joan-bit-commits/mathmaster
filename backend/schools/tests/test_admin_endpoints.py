"""Tests for the school admin endpoints: classes, invitations, audit logs,
subscription/invoices, class-code."""
import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from billing.models import Subscription, SubscriptionPlan
from classes.models import SchoolClass
from invitations.models import Invitation
from memberships.models import Membership
from schools.models import AuditLog, ClassCode, School


@pytest.fixture
def school(db):
    from accounts.models import User

    owner = User.objects.create_user(
        username='owner1', email='owner@t.com', password='Pass1234!', role='teacher'
    )
    return School.objects.create(
        name='Admin Test School', slug='admin-test', contact_email='a@t.com', created_by=owner
    )


@pytest.fixture
def owner_client(db, school):
    from accounts.models import User

    user = User.objects.create_user(username='adm', email='adm@t.com', password='Pass1234!')
    Membership.objects.create(user=user, school=school, role='owner', is_active=True)
    client = APIClient()
    client.force_authenticate(user=user)
    return client, user


@pytest.fixture
def member_client(db, school):
    from accounts.models import User

    user = User.objects.create_user(username='stud', email='stud@t.com', password='Pass1234!')
    Membership.objects.create(user=user, school=school, role='student', is_active=True)
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def plan(db):
    return SubscriptionPlan.objects.create(
        name='School', slug='school', price_monthly=29, price_annual=290
    )


@pytest.fixture
def subscription(db, school, plan):
    now = timezone.now()
    return Subscription.objects.create(
        school=school, plan=plan, status='active',
        current_period_start=now, current_period_end=now + timezone.timedelta(days=30),
    )


# ─── Classes ─────────────────────────────────────────────────────

@pytest.mark.django_db
class TestClasses:
    def test_create_list_and_soft_delete(self, owner_client, school):
        client, _ = owner_client
        resp = client.post(f'/api/schools/{school.id}/classes/', {'name': 'S1 East', 'level': 'S1'}, format='json')
        assert resp.status_code == 201
        assert resp.data['class_teacher_name'] is None
        assert resp.data['student_count'] == 0

        resp = client.get(f'/api/schools/{school.id}/classes/')
        assert resp.status_code == 200
        assert len(resp.data) == 1

        class_id = resp.data[0]['id']
        resp = client.delete(f'/api/schools/{school.id}/classes/{class_id}/')
        assert resp.status_code in (200, 204)
        assert not SchoolClass.objects.filter(id=class_id, is_archived=False).exists()

    def test_duplicate_class_rejected(self, owner_client, school):
        client, _ = owner_client
        client.post(f'/api/schools/{school.id}/classes/', {'name': 'S1 East', 'level': 'S1'}, format='json')
        resp = client.post(f'/api/schools/{school.id}/classes/', {'name': 'S1 East', 'level': 'S1'}, format='json')
        assert resp.status_code == 400

    def test_assign_teacher(self, owner_client, school):
        client, _ = owner_client
        from accounts.models import User

        cls = SchoolClass.objects.create(school=school, name='S1W', level='S1', academic_year='2026')
        teacher = User.objects.create_user(username='t1', email='t1@t.com', password='Pass1234!')
        Membership.objects.create(user=teacher, school=school, role='teacher', is_active=True)
        resp = client.post(
            f'/api/schools/{school.id}/classes/{cls.id}/assign-teacher/',
            {'teacher_id': teacher.id}, format='json',
        )
        assert resp.status_code == 200
        assert resp.data['class_teacher_name']
        cls.refresh_from_db()
        assert cls.class_teacher_id == teacher.id

    def test_assign_teacher_rejects_non_teacher(self, owner_client, school):
        client, _ = owner_client
        from accounts.models import User

        cls = SchoolClass.objects.create(school=school, name='S1X', level='S1', academic_year='2026')
        outsider = User.objects.create_user(username='o2', email='o2@t.com', password='Pass1234!')
        resp = client.post(
            f'/api/schools/{school.id}/classes/{cls.id}/assign-teacher/',
            {'teacher_id': outsider.id}, format='json',
        )
        assert resp.status_code == 400


# ─── Invitations ─────────────────────────────────────────────────

@pytest.mark.django_db
class TestInvitations:
    def test_bulk_invite_creates_and_serializes_web_shape(self, owner_client, school):
        client, user = owner_client
        resp = client.post(
            f'/api/schools/{school.id}/invitations/bulk/',
            {'invitations': [
                {'email': 'new1@t.com', 'role': 'student', 'class_level': 'S1'},
                {'email': 'new2@t.com', 'role': 'teacher'},
            ]},
            format='json',
        )
        assert resp.status_code == 201
        assert len(resp.data) == 2
        item = resp.data[0]
        assert set(item.keys()) >= {'id', 'school', 'email', 'role', 'token', 'status', 'invited_by_name', 'expires_at'}
        assert item['status'] == 'pending'
        assert item['invited_by_name']

    def test_bulk_invite_validates_rows(self, owner_client, school):
        client, _ = owner_client
        resp = client.post(
            f'/api/schools/{school.id}/invitations/bulk/',
            {'invitations': [{'email': 'bad-email', 'role': 'student'}, {'email': 'ok@t.com', 'role': 'teacher'}]},
            format='json',
        )
        assert resp.status_code == 201  # partial success
        assert Invitation.objects.filter(school=school, email='ok@t.com').exists()
        assert not Invitation.objects.filter(school=school, email='bad-email').exists()

    def test_list_and_filter(self, owner_client, school):
        client, user = owner_client
        Invitation.objects.create(
            school=school, email='p@t.com', role='student', invited_by=user,
            token='tok1', expires_at=timezone.now() + timezone.timedelta(days=7),
        )
        Invitation.objects.create(
            school=school, email='q@t.com', role='teacher', invited_by=user,
            token='tok2', status='accepted', expires_at=timezone.now() + timezone.timedelta(days=7),
        )
        resp = client.get(f'/api/schools/{school.id}/invitations/')
        assert resp.data['count'] == 2
        resp = client.get(f'/api/schools/{school.id}/invitations/?status=pending')
        assert resp.data['count'] == 1

    def test_revoke_and_resend(self, owner_client, school):
        client, user = owner_client
        inv = Invitation.objects.create(
            school=school, email='r@t.com', role='student', invited_by=user,
            token='tokR', expires_at=timezone.now() + timezone.timedelta(days=7),
        )
        resp = client.delete(f'/api/schools/{school.id}/invitations/{inv.id}/')
        assert resp.status_code == 204
        inv.refresh_from_db()
        assert inv.status == 'revoked'

        # Resend a revoked one is rejected
        resp = client.post(f'/api/schools/{school.id}/invitations/{inv.id}/resend/')
        assert resp.status_code == 400

    def test_resend_refreshes_token(self, owner_client, school):
        client, user = owner_client
        inv = Invitation.objects.create(
            school=school, email='s@t.com', role='student', invited_by=user,
            token='tokS', expires_at=timezone.now() + timezone.timedelta(days=7),
        )
        old_token = inv.token
        resp = client.post(f'/api/schools/{school.id}/invitations/{inv.id}/resend/')
        assert resp.status_code == 200
        inv.refresh_from_db()
        assert inv.token != old_token
        assert inv.status == 'pending'

    def test_student_cannot_invite(self, member_client, school):
        resp = member_client.post(
            f'/api/schools/{school.id}/invitations/bulk/',
            {'invitations': [{'email': 'x@t.com', 'role': 'student'}]},
            format='json',
        )
        assert resp.status_code == 403


# ─── Audit logs ──────────────────────────────────────────────────

@pytest.mark.django_db
class TestAuditLogs:
    def test_admin_actions_are_recorded_and_listed(self, owner_client, school):
        client, user = owner_client
        client.post(f'/api/schools/{school.id}/classes/', {'name': 'A1', 'level': 'S1'}, format='json')
        resp = client.get(f'/api/schools/{school.id}/audit-logs/')
        assert resp.status_code == 200
        assert resp.data['count'] == 1
        entry = resp.data['results'][0]
        assert entry['action'] == 'class.created'
        assert entry['actor_name']
        assert entry['actor_email']

    def test_action_filter(self, owner_client, school):
        client, user = owner_client
        AuditLog.objects.create(school=school, actor=user, action='member.removed')
        AuditLog.objects.create(school=school, actor=user, action='class.created')
        resp = client.get(f'/api/schools/{school.id}/audit-logs/?action=removed')
        assert resp.data['count'] == 1


# ─── Subscription / invoices ─────────────────────────────────────

@pytest.mark.django_db
class TestSubscription:
    def test_get_subscription_shape(self, owner_client, school, subscription):
        client, _ = owner_client
        resp = client.get(f'/api/schools/{school.id}/subscription/')
        assert resp.status_code == 200
        assert resp.data['plan'] == 'school'
        assert resp.data['amount'] == 29.0
        assert resp.data['status'] == 'active'
        assert 'current_period_end' in resp.data

    def test_cancel(self, owner_client, school, subscription):
        client, _ = owner_client
        resp = client.post(f'/api/schools/{school.id}/subscription/cancel/')
        assert resp.status_code == 200
        assert resp.data['status'] == 'canceled'
        subscription.refresh_from_db()
        assert subscription.status == 'canceled'
        assert subscription.canceled_at is not None

    def test_invoices_list(self, owner_client, school, subscription):
        client, _ = owner_client
        from billing.models import Invoice

        now = timezone.now()
        Invoice.objects.create(
            school=school, subscription=subscription, amount=29, currency='USD',
            status='paid', period_start=now - timezone.timedelta(days=30), period_end=now,
            due_at=now - timezone.timedelta(days=15), paid_at=now,
        )
        resp = client.get(f'/api/schools/{school.id}/invoices/')
        assert resp.status_code == 200
        assert resp.data['count'] == 1
        assert resp.data['results'][0]['status'] == 'paid'
        assert resp.data['results'][0]['created_at']


# ─── Class code ──────────────────────────────────────────────────

@pytest.mark.django_db
class TestClassCode:
    def test_generate_and_fetch(self, owner_client, school):
        client, _ = owner_client
        resp = client.post(f'/api/schools/{school.id}/class-code/generate/', {'role': 'student'}, format='json')
        assert resp.status_code == 201
        code = resp.data['code']
        assert len(code) == 8

        resp = client.get(f'/api/schools/{school.id}/class-code/')
        assert resp.status_code == 200
        assert resp.data['code'] == code
        assert resp.data['active'] is True

    def test_current_code_404_when_none(self, owner_client, school):
        client, _ = owner_client
        resp = client.get(f'/api/schools/{school.id}/class-code/')
        assert resp.status_code == 404
