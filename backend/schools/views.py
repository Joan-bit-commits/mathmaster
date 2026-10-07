import secrets

from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from billing.models import Subscription, SubscriptionPlan
from billing.services import get_usage_summary
from memberships.models import Membership
from memberships.permissions import (
    CanCreateSchool,
    CanManageThisSchool,
    CanViewSchoolRoster,
    IsSchoolAdmin,
    is_student_account,
)
from memberships.serializers import MembershipSerializer

from .models import ClassCode, School
from .serializers import (
    ClassCodeSerializer,
    SchoolDetailSerializer,
    SchoolSerializer,
)


class SchoolViewSet(viewsets.ModelViewSet):
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return School.objects.filter(
            memberships__user=self.request.user, memberships__is_active=True
        ).distinct()

    def get_serializer_class(self):
        # Detail responses carry the subscription fields (logo_url,
        # trial_ends_at, current_period_end) the web settings pages read.
        return SchoolDetailSerializer if self.action == 'retrieve' else super().get_serializer_class()

    def get_permissions(self):
        # Students (by account type) can read their schools but never create or manage one.
        if self.action == 'create':
            return [IsAuthenticated(), CanCreateSchool()]
        if self.action in ('update', 'partial_update', 'destroy', 'usage'):
            return [IsAuthenticated(), CanManageThisSchool()]
        if self.action == 'members':
            return [IsAuthenticated(), CanViewSchoolRoster()]
        return [IsAuthenticated()]

    @transaction.atomic
    def perform_create(self, serializer):
        school = serializer.save(created_by=self.request.user)
        Membership.objects.create(user=self.request.user, school=school, role='owner')
        self.request.user.current_school = school
        self.request.user.save(update_fields=['current_school'])
        plan, _ = SubscriptionPlan.objects.get_or_create(slug='free', defaults={'name': 'Free'})
        now = timezone.now()
        Subscription.objects.create(
            school=school,
            plan=plan,
            current_period_start=now,
            current_period_end=now + timezone.timedelta(days=14),
            trial_ends_at=now + timezone.timedelta(days=14),
        )

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Everything the client needs to pick a school context in one call:
        the user's schools plus their membership (role) in each, mapped to the
        web app's Membership shape."""
        schools = self.get_queryset()
        memberships = Membership.objects.filter(
            user=request.user, is_active=True, school__in=schools
        ).select_related('school', 'user')
        by_school = {m.school_id: m for m in memberships}
        results = []
        for school in schools:
            membership = by_school.get(school.id)
            results.append({
                **self.get_serializer(school).data,
                'membership': (
                    {
                        'id': membership.id,
                        'school': school.id,
                        'role': membership.role,
                        'class_level': membership.class_level or None,
                        'class_stream': membership.class_stream or None,
                        'admission_number': membership.admission_number or None,
                        'parent_email': membership.parent_email or None,
                        'is_active': membership.is_active,
                        'joined_at': membership.joined_at,
                        'last_active_at': membership.last_active_at,
                    }
                    if membership
                    else None
                ),
            })
        return Response(results)

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        school = self.get_object()
        queryset = Membership.objects.filter(school=school, is_active=True).select_related('user')
        role = request.query_params.get('role')
        search = request.query_params.get('search')
        if role:
            queryset = queryset.filter(role=role)
        if search:
            queryset = (
                queryset.filter(user__first_name__icontains=search)
                | queryset.filter(user__last_name__icontains=search)
                | queryset.filter(user__email__icontains=search)
            )
        return Response(
            {'count': queryset.count(), 'results': MembershipSerializer(queryset, many=True).data}
        )

    @action(detail=True, methods=['get'])
    def usage(self, request, pk=None):
        return Response(get_usage_summary(self.get_object()))


class JoinSchoolByCodeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        class_code = ClassCode.objects.select_related('school').filter(code=code).first()
        if not class_code:
            return Response({'error': 'Invalid code'}, status=status.HTTP_404_NOT_FOUND)
        if not class_code.is_valid():
            return Response({'error': 'Code expired or no longer valid'}, status=status.HTTP_400_BAD_REQUEST)
        if is_student_account(request.user) and class_code.target_role not in ('student', 'parent'):
            return Response(
                {'error': 'Student accounts can only join a school as a student.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        membership, _ = Membership.objects.get_or_create(
            user=request.user, school=class_code.school, defaults={'role': class_code.target_role}
        )
        if not membership.is_active:
            membership.is_active = True
            membership.save(update_fields=['is_active'])
        class_code.current_uses += 1
        class_code.save(update_fields=['current_uses'])
        return Response(
            {
                'school': SchoolSerializer(class_code.school, context={'request': request}).data,
                'membership': MembershipSerializer(membership).data,
            }
        )


class ClassCodeViewSet(viewsets.ModelViewSet):
    serializer_class = ClassCodeSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get_queryset(self):
        return ClassCode.objects.filter(school_id=self.kwargs['school_id'])

    def perform_create(self, serializer):
        school = School.objects.get(id=self.kwargs['school_id'])
        serializer.save(
            school=school, code=secrets.token_urlsafe(6).upper()[:8], created_by=self.request.user
        )