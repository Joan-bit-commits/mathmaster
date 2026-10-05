from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.utils import timezone

from schools.models import ClassCode, School, SchoolDomain


@pytest.mark.django_db
def test_school_generates_unique_slug():
    user = get_user_model().objects.create_user(username='owner', password='password')
    first = School.objects.create(name='North School', contact_email='one@example.com', created_by=user)
    second = School.objects.create(name='North School', contact_email='two@example.com', created_by=user)
    assert first.slug == 'north-school'
    assert second.slug == 'north-school-1'


@pytest.mark.django_db
def test_class_code_validity():
    user = get_user_model().objects.create_user(username='owner2', password='password')
    school = School.objects.create(name='Code School', contact_email='one@example.com', created_by=user)
    code = ClassCode.objects.create(school=school, code='JOIN123', created_by=user, max_uses=1)
    assert code.is_valid()
    code.current_uses = 1
    assert not code.is_valid()
    code.current_uses = 0
    code.expires_at = timezone.now() - timedelta(seconds=1)
    assert not code.is_valid()


@pytest.mark.django_db
def test_school_domain_is_unique():
    user = get_user_model().objects.create_user(username='owner3', password='password')
    school = School.objects.create(name='Domain School', contact_email='one@example.com', created_by=user)
    SchoolDomain.objects.create(school=school, domain='math.example.com')
    with pytest.raises(IntegrityError):
        SchoolDomain.objects.create(school=school, domain='math.example.com')
