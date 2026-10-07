from rest_framework.permissions import BasePermission

STUDENT_MESSAGE = 'Student accounts cannot create or manage schools.'


def is_student_account(user) -> bool:
    """True for users who registered as students (account type, not their per-school role)."""
    return bool(getattr(user, 'role', None) == 'student' and not getattr(user, 'is_superuser', False))


def school_manager_membership(user, school):
    """The user's active owner/admin membership in `school`, or None.

    Student accounts never manage a school, even if a stale owner/admin membership row exists.
    """
    if not (user and user.is_authenticated) or school is None or is_student_account(user):
        return None
    from memberships.models import Membership

    return Membership.objects.filter(
        user=user, school=school, role__in=('owner', 'admin'), is_active=True
    ).first()


class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        membership = getattr(request, 'membership', None)
        return bool(
            request.user.is_authenticated
            and getattr(request, 'school', None)
            and membership
            and membership.is_active
        )


class IsSchoolAdmin(BasePermission):
    message = STUDENT_MESSAGE

    def has_permission(self, request, view):
        membership = getattr(request, 'membership', None)
        return bool(
            request.user.is_authenticated
            and not is_student_account(request.user)
            and membership
            and membership.role in ('owner', 'admin')
        )


class IsSchoolTeacherOrAdmin(BasePermission):
    message = 'Student accounts cannot perform this action.'

    def has_permission(self, request, view):
        membership = getattr(request, 'membership', None)
        return bool(
            request.user.is_authenticated
            and not is_student_account(request.user)
            and membership
            and membership.role in ('owner', 'admin', 'teacher')
        )


class CanCreateSchool(BasePermission):
    """Only teacher/admin accounts may create schools."""

    message = 'Student accounts cannot create schools.'

    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and not is_student_account(request.user))


class CanManageThisSchool(BasePermission):
    """Object-level: owner/admin of *this* school (not merely of the school named in X-School-Id)."""

    message = STUDENT_MESSAGE

    def has_permission(self, request, view):
        return bool(request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return school_manager_membership(request.user, obj) is not None


class CanViewSchoolRoster(BasePermission):
    """Object-level: staff (owner/admin/teacher) of this school may list its members."""

    message = 'Only school staff can view the member list.'

    def has_permission(self, request, view):
        return bool(request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if is_student_account(request.user):
            return False
        from memberships.models import Membership

        return Membership.objects.filter(
            user=request.user, school=obj, role__in=('owner', 'admin', 'teacher'), is_active=True
        ).exists()


class HasQuotaFor(BasePermission):
    def has_permission(self, request, view):
        action = getattr(view, 'quota_action', None)
        return True if not action else check_quota(request.school, action)


def check_quota(school, action):
    from billing.services import check_quota as billing_check_quota

    return billing_check_quota(school, action)