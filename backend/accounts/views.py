from django.db import transaction
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
        with transaction.atomic():
            user = serializer.save()
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
