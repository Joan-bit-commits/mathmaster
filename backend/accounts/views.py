from django.db import transaction
from django.utils import timezone
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from analytics.signals_utils import track_event
from memberships.models import Membership
from memberships.serializers import MembershipSerializer
from schools.serializers import SchoolSerializer

from .models import User
from .serializers import RegisterSerializer, UserSerializer


@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='post')
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={201: UserSerializer},
        auth=[],
        tags=['auth'],
        summary='Register a new account',
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invite_token = request.data.get('invite_token')
        if invite_token and serializer.validated_data.get('role', 'student') == 'student':
            from invitations.models import Invitation

            pending = Invitation.objects.filter(token=invite_token, status='pending').first()
            if pending and pending.role not in ('student', 'parent'):
                return Response(
                    {'error': 'This invitation is for a staff role. Register a teacher account to accept it.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        with transaction.atomic():
            user = serializer.save()
            if invite_token:
                from invitations.models import Invitation

                invite = Invitation.objects.filter(token=invite_token, status='pending').first()
                if not invite or not invite.is_valid():
                    return Response(
                        {'error': 'Invalid or expired invitation'}, status=status.HTTP_400_BAD_REQUEST
                    )
                Membership.objects.create(
                    user=user,
                    school=invite.school,
                    role=invite.role,
                    class_level=invite.class_level,
                    class_stream=invite.class_stream,
                    admission_number=invite.admission_number,
                    invited_by=invite.invited_by,
                )
                user.current_school = invite.school
                user.save(update_fields=['current_school'])
                invite.status = 'accepted'
                invite.accepted_at = timezone.now()
                invite.accepted_by = user
                invite.save(update_fields=['status', 'accepted_at', 'accepted_by'])
            transaction.on_commit(lambda: track_event(user, 'register'))

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'detail': 'User registered successfully',
            },
            status=status.HTTP_201_CREATED,
        )


@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='post')
class LoginView(TokenObtainPairView):
    @extend_schema(
        auth=[],
        tags=['auth'],
        summary='Obtain access and refresh tokens',
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.filter(username=request.data.get('username')).first()
            if user:
                transaction.on_commit(lambda: track_event(user, 'login'))
        return response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: UserSerializer},
        tags=['auth'],
        summary='Get the current user profile',
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class SwitchSchoolView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        membership = (
            Membership.objects.filter(
                user=request.user, school_id=request.data.get('school_id'), is_active=True
            )
            .select_related('school')
            .first()
        )
        if not membership:
            return Response(
                {'error': 'No active membership in this school'}, status=status.HTTP_403_FORBIDDEN
            )
        request.user.current_school = membership.school
        request.user.save(update_fields=['current_school'])
        membership.last_active_at = timezone.now()
        membership.save(update_fields=['last_active_at'])
        return Response(
            {
                'school': SchoolSerializer(membership.school, context={'request': request}).data,
                'membership': MembershipSerializer(membership).data,
            }
        )