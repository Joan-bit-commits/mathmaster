from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from utils.gemini import ask_gemini
from utils.prompts import math_tutor_prompt

from .serializers import AITutorRequestSerializer


class AITutorAskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AITutorRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        topic = serializer.validated_data['topic']
        question = serializer.validated_data['question']
        level = serializer.validated_data.get('level') or getattr(request.user, 'role', '') or ''
        context = serializer.validated_data.get('context', '')

        prompt = math_tutor_prompt(topic=topic, question=question, level=level, context=context)

        try:
            answer = ask_gemini(prompt)
        except Exception as exc:
            return Response(
                {
                    'detail': 'AI tutor is temporarily unavailable.',
                    'error': str(exc),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                'topic': topic,
                'level': level,
                'answer': answer,
            },
            status=status.HTTP_200_OK,
        )
