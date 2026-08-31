from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsTeacherOrAdmin

from .serializers import (
    EventSerializer,
    RecommendationSerializer,
    SummarySerializer,
    TeacherOverviewSerializer,
    TopicPerformanceSerializer,
)
from .services import (
    get_active_recommendations,
    student_summary,
    teacher_overview,
    topic_performance,
)
from .signals_utils import track_event

PERIOD_CHOICES = ('7d', '30d', 'all')


class EventCreateView(APIView):
    """POST /api/analytics/events/ — record a client-side learning event."""

    def post(self, request):
        serializer = EventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = track_event(
            request.user,
            event_type=serializer.validated_data['event_type'],
            topic=serializer.validated_data.get('topic'),
            lesson=serializer.validated_data.get('lesson'),
            quiz=serializer.validated_data.get('quiz'),
            question=serializer.validated_data.get('question'),
            metadata=serializer.validated_data.get('metadata') or {},
        )
        return Response({'id': event.id}, status=status.HTTP_201_CREATED)


class SummaryView(APIView):
    """GET /api/analytics/summary/?period=7d|30d|all"""

    def get(self, request):
        period = request.query_params.get('period', 'all')
        if period not in PERIOD_CHOICES:
            return Response(
                {'detail': f'period must be one of: {", ".join(PERIOD_CHOICES)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        summary = student_summary(request.user, period=period)
        return Response(SummarySerializer(summary).data)


class TopicPerformanceView(APIView):
    """GET /api/analytics/performance/topics/ — per-topic avg score."""

    def get(self, request):
        return Response(TopicPerformanceSerializer(topic_performance(request.user), many=True).data)


class RecommendationListView(APIView):
    """GET /api/analytics/recommendations/ — active (non-expired) recommendations."""

    def get(self, request):
        recs = get_active_recommendations(request.user)
        return Response(RecommendationSerializer(recs, many=True).data)


class TeacherOverviewView(APIView):
    """GET /api/analytics/teacher/overview/ — cohort stats (teacher/admin)."""
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        return Response(TeacherOverviewSerializer(teacher_overview()).data)
