import logging

from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import run_ask, run_ask_stream
from .serializers import AITutorRequestSerializer

logger = logging.getLogger(__name__)


class AITutorAskView(APIView):
    """Non-streaming AI tutor endpoint (web fallback)."""
    permission_classes = [IsAuthenticated]
    throttle_scope = 'ai_tutor'

    def post(self, request):
        serializer = AITutorRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload, status_code, _ = run_ask(request, serializer.validated_data)
        return Response(payload, status=status_code)


class AITutorStreamView(APIView):
    """SSE streaming AI tutor endpoint."""
    permission_classes = [IsAuthenticated]
    throttle_scope = 'ai_tutor'

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
