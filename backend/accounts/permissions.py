from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsTeacher(BasePermission):
    message = 'Only teachers can perform this action.'

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.role == 'teacher')


class IsAdmin(BasePermission):
    message = 'Only admins can perform this action.'

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.role == 'admin' or user.is_superuser)
        )


class IsStudent(BasePermission):
    message = 'Only students can perform this action.'

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.role == 'student')


class IsStaffMember(BasePermission):
    """Teacher, admin or superuser regardless of HTTP method."""

    message = 'Only teachers and admins can perform this action.'

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.role in ('teacher', 'admin') or user.is_superuser)
        )


class IsTeacherOrAdmin(BasePermission):
    """Read for everyone authenticated; write for teachers/admins.

    Object-level: teachers may only mutate objects they created
    (admins may mutate anything)."""
    message = 'You do not have permission to modify this content.'

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return user.role in ('teacher', 'admin') or user.is_superuser

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if user.role == 'admin' or user.is_superuser:
            return True
        if user.role == 'teacher':
            owner = getattr(obj, 'created_by', None)
            return owner is None or owner == user
        return False


class IsStudentSelf(BasePermission):
    """Object-level: only the owning student may access their own records."""

    def has_object_permission(self, request, view, obj) -> bool:
        owner = getattr(obj, 'student', None)
        return bool(request.user and owner == request.user)
