import logging

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class TenantMiddleware(MiddlewareMixin):
    EXEMPT_PATHS = (
        '/api/accounts/',
        '/api/schools/me/',
        '/api/schools/join-by-code/',
        '/api/billing/webhooks/',
        '/api/schools/create/',
        '/admin/',
        '/api/schema/',
        '/api/docs/',
        '/health/',
        '/api/health/',
        '/static/',
        '/media/',
    )

    def process_request(self, request):
        request.school = None
        request.membership = None
        request.school_resolution_method = None
        if request.path.startswith(self.EXEMPT_PATHS):
            return None

        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return None

        from memberships.models import Membership
        from schools.models import School

        school_id = request.headers.get('X-School-Id')
        if school_id:
            membership = (
                Membership.objects.filter(
                    user=user, school_id=school_id, school__is_active=True, is_active=True
                )
                .select_related('school')
                .first()
            )
            if membership:
                request.school = membership.school
                request.membership = membership
                request.school_resolution_method = 'header'
                return None

        host = request.get_host().split(':', 1)[0]
        parts = host.split('.')
        if len(parts) >= 3 and not host.startswith('www.'):
            school = School.objects.filter(slug=parts[0], is_active=True).first()
            membership = (
                Membership.objects.filter(user=user, school=school, is_active=True).first()
                if school
                else None
            )
            if membership:
                request.school = school
                request.membership = membership
                request.school_resolution_method = 'subdomain'
                return None

        current_school = getattr(user, 'current_school', None)
        membership = Membership.objects.filter(user=user, school=current_school, is_active=True).first()
        if membership:
            request.school = current_school
            request.membership = membership
            request.school_resolution_method = 'fallback'
        return None
