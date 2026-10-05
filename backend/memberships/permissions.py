from rest_framework.permissions import BasePermission


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
    def has_permission(self, request, view):
        membership = getattr(request, 'membership', None)
        return bool(request.user.is_authenticated and membership and membership.role in ('owner', 'admin'))


class IsSchoolTeacherOrAdmin(BasePermission):
    def has_permission(self, request, view):
        membership = getattr(request, 'membership', None)
        return bool(
            request.user.is_authenticated and membership and membership.role in ('owner', 'admin', 'teacher')
        )


class HasQuotaFor(BasePermission):
    def has_permission(self, request, view):
        action = getattr(view, 'quota_action', None)
        return True if not action else check_quota(request.school, action)


def check_quota(school, action):
    from billing.services import check_quota as billing_check_quota

    return billing_check_quota(school, action)
