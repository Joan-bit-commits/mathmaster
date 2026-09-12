import logging

from django.db.models import Count
from django.http import StreamingHttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from utils.renderers import ServerSentEventRenderer

from .models import ChatSession
from .serializers import AITutorRequestSerializer, ChatSessionDetailSerializer, ChatSessionSerializer
from .services import run_ask, run_ask_stream

logger = logging.getLogger(__name__)


class AITutorAskView(APIView):
    """Non-streaming AI tutor endpoint (web fallback)."""

    permission_classes = [IsAuthenticated]
    throttle_scope = 'ai_tutor'

    @extend_schema(
        request=AITutorRequestSerializer,
        responses={200: {'type': 'object', 'properties': {'answer': {'type': 'string'}}}, 503: None},
        tags=['ai-tutor'],
        summary='Ask the AI tutor (non-streaming)',
    )
    def post(self, request):
        serializer = AITutorRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload, status_code, _ = run_ask(request, serializer.validated_data)
        return Response(payload, status=status_code)


class AITutorStreamView(APIView):
    """SSE streaming AI tutor endpoint."""

    permission_classes = [IsAuthenticated]
    throttle_scope = 'ai_tutor'
    # See utils/renderers.py — without this, DRF's content negotiation
    # 406s the request before post() runs, because the client's
    # Accept: text/event-stream doesn't match either default renderer.
    renderer_classes = [ServerSentEventRenderer, JSONRenderer]

    @extend_schema(
        request=AITutorRequestSerializer,
        responses={200: {'type': 'string', 'format': 'binary'}, 503: None},
        tags=['ai-tutor'],
        summary='Ask the AI tutor (SSE streaming)',
    )
    def post(self, request):
        serializer = AITutorRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        response = StreamingHttpResponse(
            run_ask_stream(request, serializer.validated_data),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response


class ChatSessionListView(generics.ListAPIView):
    """GET /api/ai-tutor/sessions/ — was missing entirely; the mobile
    client's getSessions() has been calling this URL since it was written
    and getting a 404 in any non-mock environment."""

    permission_classes = [IsAuthenticated]
    serializer_class = ChatSessionSerializer

    def get_queryset(self):
        return (
            ChatSession.objects.filter(student=self.request.user)
            .annotate(message_count=Count('messages'))
            .order_by('-updated_at')
        )


class ChatSessionDetailView(generics.RetrieveDestroyAPIView):
    """GET/DELETE /api/ai-tutor/sessions/<id>/ — full message history for one
    session, plus the ability to delete it."""

    permission_classes = [IsAuthenticated]
    serializer_class = ChatSessionDetailSerializer

    def get_queryset(self):
        return ChatSession.objects.filter(student=self.request.user).annotate(
            message_count=Count('messages')
        )