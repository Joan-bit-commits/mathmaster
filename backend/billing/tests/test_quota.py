from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.utils import timezone

from billing.models import Subscription, SubscriptionPlan
from billing.services import check_quota, get_current_usage, track_usage
from memberships.models import Membership
from schools.models import School


@pytest.mark.django_db
def test_student_quota_is_enforced():
    user = get_user_model().objects.create_user(username='billing-owner', password='password')
    student = get_user_model().objects.create_user(username='billing-student', password='password')
    school = School.objects.create(name='Billing School', contact_email='one@example.com', created_by=user)
    plan = SubscriptionPlan.objects.create(name='Small', slug='small', max_students=1)
    Subscription.objects.create(
        school=school,
        plan=plan,
        current_period_start=timezone.now(),
        current_period_end=timezone.now() + timedelta(days=1),
    )
    Membership.objects.create(user=student, school=school, role='student')
    with pytest.raises(PermissionDenied):
        check_quota(school, 'invite_student')


@pytest.mark.django_db
def test_track_usage_increments():
    user = get_user_model().objects.create_user(username='usage-owner', password='password')
    school = School.objects.create(name='Usage School', contact_email='one@example.com', created_by=user)
    track_usage(school, 'ai_questions')
    track_usage(school, 'ai_questions', 2)
    assert get_current_usage(school, 'ai_questions') == 3
