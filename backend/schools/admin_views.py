"""School-scoped admin endpoints the web app's settings pages call:

  GET/POST/PATCH/DELETE /api/schools/<id>/classes/            (SchoolClass CRUD)
  POST                  /api/schools/<id>/classes/<cid>/assign-teacher/
  GET                   /api/schools/<id>/invitations/       (list, ?status=)
  POST                  /api/schools/<id>/invitations/bulk/  (send many)
  POST                  /api/schools/<id>/invitations/<iid>/resend/
  DELETE                /api/schools/<id>/invitations/<iid>/ (revoke)
  GET                   /api/schools/<id>/audit-logs/
  GET                   /api/schools/<id>/subscription/
  POST                  /api/schools/<id>/subscription/cancel/
  GET                   /api/schools/<id>/invoices/
  POST                  /api/schools/<id>/class-code/generate/
  GET                   /api/schools/<id>/class-code/
"""
import logging

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from billing.models import Invoice, Subscription
from classes.models import SchoolClass
from invitations.models import Invitation
from memberships.models import Membership
from memberships.permissions import IsSchoolAdmin, school_manager_membership

from .models import AuditLog, ClassCode
from .serializers import (
    AuditLogSerializer,
    ClassCodeSerializer,
    InvoiceSerializer,
    SchoolClassSerializer,
    SubscriptionSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)

INVITABLE_ROLES = ('teacher', 'student', 'admin')


def record_audit(school, actor, action, target='', metadata=None):
    AuditLog.objects.create(school=school, actor=actor, action=action, target=str(target)[:200], metadata=metadata or {})


def _admin_membership(user, school):
    """Return the user's owner/admin membership for the school, or None."""
    return school_manager_membership(user, school)


class SchoolAdminMixin:
    """Common helper: resolve the school and require an owner/admin membership."""

    def get_school(self, request, school_id):
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        if _admin_membership(request.user, school) is None:
            self.permission_denied(request, message='Only school admins can manage this school.')
        return school


# Import at the bottom to avoid a circular import between schools.models and
# other apps' signals firing on import order. (Safe: models are loaded by then.)
from .models import School as SchoolForAdmin  # noqa: E402


class SchoolClassesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, school_id):
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        if not request.user.memberships.filter(school=school, is_active=True).exists():
            return Response({'error': {'code': 'FORBIDDEN', 'message': 'Not a member of this school.'}}, status=403)
        qs = SchoolClass.objects.filter(school=school, is_archived=False).order_by('level', 'name')
        return Response(SchoolClassSerializer(qs, many=True, context={'request': request}).data)

    def post(self, request, school_id):
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        if _admin_membership(request.user, school) is None:
            return Response({'error': {'code': 'FORBIDDEN', 'message': 'Only school admins can manage classes.'}}, status=403)
        data = {
            'name': request.data.get('name'),
            'level': request.data.get('level', 'S1'),
            'academic_year': request.data.get('academic_year') or str(timezone.now().year),
        }
        if not data['name']:
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': 'name is required.'}}, status=400)
        existing = SchoolClass.objects.filter(school=school, name=data['name'], academic_year=data['academic_year']).first()
        if existing:
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': 'Class with this name already exists for the year.'}}, status=400)
        cls = SchoolClass.objects.create(school=school, **data)
        record_audit(school, request.user, 'class.created', target=f'class:{cls.id}', metadata={'name': cls.name})
        return Response(SchoolClassSerializer(cls, context={'request': request}).data, status=201)


class SchoolClassDetailView(SchoolAdminMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        school = get_object_or_404(SchoolForAdmin, id=self.kwargs['school_id'])
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            if not self.request.user.memberships.filter(school=school, is_active=True).exists():
                self.permission_denied(self.request, message='Not a member of this school.')
        else:
            self.get_school(self.request, self.kwargs['school_id'])  # managers only
        return SchoolClass.objects.filter(school_id=self.kwargs['school_id'], is_archived=False)

    def get_serializer(self, *args, **kwargs):
        return SchoolClassSerializer(*args, context={'request': self.request}, **kwargs)

    def perform_destroy(self, instance):
        instance.is_archived = True  # soft delete
        instance.save(update_fields=['is_archived'])
        record_audit(instance.school, self.request.user, 'class.deleted', target=f'class:{instance.id}')


class AssignClassTeacherView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, school_id, class_id):
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        if _admin_membership(request.user, school) is None:
            return Response({'error': {'code': 'FORBIDDEN', 'message': 'Only school admins can assign teachers.'}}, status=403)
        cls = get_object_or_404(SchoolClass, id=class_id, school=school)
        teacher_id = request.data.get('teacher_id')
        teacher = User.objects.filter(id=teacher_id).first() if teacher_id else None
        if not teacher:
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': 'teacher_id not found.'}}, status=400)
        if not teacher.memberships.filter(school=school, role__in=('teacher', 'admin', 'owner'), is_active=True).exists():
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': 'User is not a teacher at this school.'}}, status=400)
        cls.class_teacher = teacher
        cls.save(update_fields=['class_teacher', 'updated_at'])
        record_audit(school, request.user, 'class.teacher_assigned', target=f'class:{cls.id}', metadata={'teacher_id': teacher.id})
        return Response(SchoolClassSerializer(cls, context={'request': request}).data)


class SchoolInvitationsView(SchoolAdminMixin, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = None  # plain dict shape below matches the web Invitation type

    def get_queryset(self):
        # Invitation tokens are accept-credentials: managers only.
        school = self.get_school(self.request, self.kwargs['school_id'])
        qs = Invitation.objects.filter(school=school)
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            qs = qs.filter(status=status_filter)
        return qs

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        results = [self._serialize(inv) for inv in qs]
        return Response({'count': len(results), 'results': results})

    @staticmethod
    def _serialize(inv):
        return {
            'id': inv.id,
            'school': inv.school_id,
            'email': inv.email,
            'role': inv.role,
            'class_level': inv.class_level or None,
            'token': inv.token,
            'status': inv.status,
            'invited_by_name': (inv.invited_by.get_full_name() or inv.invited_by.username) if inv.invited_by else '',
            'expires_at': inv.expires_at,
            'accepted_at': inv.accepted_at,
            'created_at': inv.created_at,
        }


class BulkInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, school_id):
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        membership = _admin_membership(request.user, school)
        if membership is None:
            return Response({'error': {'code': 'FORBIDDEN', 'message': 'Only school admins can send invitations.'}}, status=403)
        invitations = request.data.get('invitations') or []
        if not isinstance(invitations, list) or not invitations:
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': 'invitations must be a non-empty list.'}}, status=400)
        if len(invitations) > 100:
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': 'At most 100 invitations per request.'}}, status=400)

        created = []
        errors = []
        for i, inv in enumerate(invitations):
            email = (inv.get('email') or '').strip().lower()
            role = inv.get('role', 'student')
            if not email or '@' not in email or ' ' in email:
                errors.append({'row': i, 'message': 'Valid email required.'})
                continue
            if role not in INVITABLE_ROLES:
                errors.append({'row': i, 'message': f"Role must be one of {', '.join(INVITABLE_ROLES)}."})
                continue
            try:
                obj, was_created = Invitation.objects.get_or_create(
                    school=school, email=email, role=role, status='pending',
                    defaults={
                        'class_level': inv.get('class_level') or '',
                        'invited_by': request.user,
                        'metadata': inv.get('metadata') or {},
                    },
                )
            except Exception:
                errors.append({'row': i, 'message': 'Could not create invitation.'})
                continue
            if was_created:
                created.append(obj)
                record_audit(school, request.user, 'invitation.sent', target=f'invitation:{obj.id}', metadata={'email': email, 'role': role})
            else:
                # Refresh an existing pending invitation instead of failing.
                obj.expires_at = timezone.now() + timezone.timedelta(days=7)
                obj.save(update_fields=['expires_at'])
                created.append(obj)
        return Response([BulkInviteView.serialize_created(c) for c in created], status=201)

    @staticmethod
    def serialize_created(inv):
        return SchoolInvitationsView._serialize(inv)


class InvitationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, school_id, invitation_id):
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        if _admin_membership(request.user, school) is None:
            return Response({'error': {'code': 'FORBIDDEN', 'message': 'Only school admins can revoke invitations.'}}, status=403)
        inv = get_object_or_404(Invitation, id=invitation_id, school=school)
        inv.status = 'revoked'
        inv.revoked_at = timezone.now()
        inv.revoked_by = request.user
        inv.save(update_fields=['status', 'revoked_at', 'revoked_by'])
        record_audit(school, request.user, 'invitation.revoked', target=f'invitation:{inv.id}', metadata={'email': inv.email})
        return Response(status=204)

    def post(self, request, school_id, invitation_id):
        """Resend: refresh expiry + new token for a pending invitation."""
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        if _admin_membership(request.user, school) is None:
            return Response({'error': {'code': 'FORBIDDEN', 'message': 'Only school admins can resend invitations.'}}, status=403)
        inv = get_object_or_404(Invitation, id=invitation_id, school=school)
        if inv.status not in ('pending', 'expired'):
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': f'Cannot resend a {inv.status} invitation.'}}, status=400)
        import secrets as _secrets

        inv.token = _secrets.token_urlsafe(32)
        inv.expires_at = timezone.now() + timezone.timedelta(days=7)
        inv.status = 'pending'
        inv.save(update_fields=['token', 'expires_at', 'status'])
        record_audit(school, request.user, 'invitation.resent', target=f'invitation:{inv.id}')
        return Response(SchoolInvitationsView._serialize(inv))


class AuditLogsView(SchoolAdminMixin, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        school = self.get_school(self.request, self.kwargs['school_id'])
        qs = school.audit_logs.all()
        action = self.request.query_params.get('action')
        if action:
            qs = qs.filter(action__icontains=action)
        actor = self.request.query_params.get('actor')
        if actor:
            qs = qs.filter(actor_id=actor)
        return qs


def request_is_member(user, school):
    return user.memberships.filter(school=school, is_active=True).exists()


class SchoolSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, school_id):
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        if _admin_membership(request.user, school) is None:
            return Response({'error': {'code': 'FORBIDDEN', 'message': 'Only school admins can view billing.'}}, status=403)
        subscription = self._ensure_subscription(school)
        return Response(SubscriptionSerializer(subscription, context={'request': request}).data)

    @staticmethod
    def _ensure_subscription(school):
        """Schools created outside perform_create (e.g. the personal-school
        signal) have no subscription row — provision a free one on first read
        so the billing page never 404s."""
        from billing.models import SubscriptionPlan

        subscription = getattr(school, 'subscription', None)
        if subscription is None:
            now = timezone.now()
            plan, _ = SubscriptionPlan.objects.get_or_create(slug='free', defaults={'name': 'Free'})
            subscription = Subscription.objects.create(
                school=school, plan=plan, status='active',
                current_period_start=now,
                current_period_end=now + timezone.timedelta(days=36500),
            )
        return subscription


class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, school_id):
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        if _admin_membership(request.user, school) is None:
            return Response({'error': {'code': 'FORBIDDEN', 'message': 'Only school admins can cancel the subscription.'}}, status=403)
        subscription = getattr(school, 'subscription', None)
        if subscription is None:
            return Response({'error': {'code': 'NOT_FOUND', 'message': 'No subscription for this school.'}}, status=404)
        if subscription.status == 'canceled':
            return Response({'status': 'canceled'})
        subscription.status = 'canceled'
        subscription.canceled_at = timezone.now()
        subscription.save(update_fields=['status', 'canceled_at', 'updated_at'])
        record_audit(school, request.user, 'subscription.canceled', target=f'subscription:{subscription.id}')
        return Response({'status': 'canceled'})


class SchoolInvoicesView(SchoolAdminMixin, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        school = self.get_school(self.request, self.kwargs['school_id'])
        return school.invoices.all()


class GenerateClassCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, school_id):
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        if _admin_membership(request.user, school) is None:
            return Response({'error': {'code': 'FORBIDDEN', 'message': 'Only school admins can generate class codes.'}}, status=403)
        code = ClassCode.objects.create(
            school=school,
            code='-unused-',  # placeholder; perform_create in the ViewSet normally sets this
            target_role=request.data.get('role', 'student'),
            max_uses=request.data.get('max_uses'),
            created_by=request.user,
        )
        import secrets as _secrets

        code.code = _secrets.token_urlsafe(6).upper()[:8]
        code.save(update_fields=['code'])
        record_audit(school, request.user, 'class_code.generated', target=f'class-code:{code.id}')
        return Response(
            ClassCodeSerializer(code, context={'request': request}).data,
            status=201,
        )


class CurrentClassCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, school_id):
        school = get_object_or_404(SchoolForAdmin, id=school_id)
        # The join code grants membership, so only school admins may read it.
        if _admin_membership(request.user, school) is None:
            return Response({'error': {'code': 'FORBIDDEN', 'message': 'Only school admins can view the class code.'}}, status=403)
        code = ClassCode.objects.filter(school=school, is_active=True).order_by('-created_at').first()
        if not code:
            return Response({'error': {'code': 'NOT_FOUND', 'message': 'No active class code. Generate one first.'}}, status=404)
        data = ClassCodeSerializer(code, context={'request': request}).data
        data['active'] = code.is_valid()
        return Response(data)


class Unused:  # keeps basedpyright satisfied about unused imports if trimmed later
    pass