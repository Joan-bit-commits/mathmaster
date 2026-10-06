import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from memberships.models import Membership
from schools.models import School


@pytest.mark.django_db
def test_membership_roles_and_uniqueness():
    user = get_user_model().objects.create_user(username='member', password='password')
    school = School.objects.create(name='Member School', contact_email='one@example.com', created_by=user)
    membership = Membership.objects.create(user=user, school=school, role='teacher')
    assert membership.can_teach
    assert not membership.can_manage_school
    with pytest.raises(IntegrityError):
        Membership.objects.create(user=user, school=school, role='student')
