import logging

from django.http import StreamingHttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import AITutorRequestSerializer
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
