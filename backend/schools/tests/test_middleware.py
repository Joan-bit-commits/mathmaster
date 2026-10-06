import pytest
from django.contrib.auth import get_user_model
from django.test import RequestFactory

from memberships.models import Membership
from schools.middleware import TenantMiddleware
from schools.models import School


@pytest.mark.django_db
def test_header_and_fallback_resolution():
    user = get_user_model().objects.create_user(username='middleware-user', password='password')
    school = School.objects.create(name='Middleware School', contact_email='one@example.com', created_by=user)
    Membership.objects.create(user=user, school=school, role='owner')
    request = RequestFactory().get('/api/learning/topics/', HTTP_X_SCHOOL_ID=str(school.id))
    request.user = user
    TenantMiddleware(lambda request: None).process_request(request)
    assert request.school == school
    assert request.school_resolution_method == 'header'

    user.current_school = school
    user.save(update_fields=['current_school'])
    request = RequestFactory().get('/api/learning/topics/')
    request.user = user
    TenantMiddleware(lambda request: None).process_request(request)
    assert request.school == school
    assert request.school_resolution_method == 'fallback'
