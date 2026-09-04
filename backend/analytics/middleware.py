"""Middleware that auto-logs lesson_view and quiz_submit events from URL hits."""

import logging

from learning.models import Lesson, Quiz

from .signals_utils import track_event

logger = logging.getLogger(__name__)


class AnalyticsMiddleware:
    """Auto-log lesson_view / quiz_submit when those URLs are hit successfully."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        try:
            self._maybe_track(request, response)
        except Exception:  # never break the response because of analytics
            logger.exception('Analytics middleware tracking failed')
        return response

    def _maybe_track(self, request, response):
        if request.method != 'GET' or response.status_code != 200:
            return
        user = getattr(request, 'user', None)
        if user is None or not user.is_authenticated or user.role != 'student':
            return

        path = request.path
        if path.startswith('/api/learning/lessons/'):
            lesson_id = self._extract_id(path, 'lessons')
            if lesson_id and not self._is_nested(path):
                lesson = Lesson.objects.filter(id=lesson_id).first()
                if lesson:
                    track_event(user, 'lesson_view', topic=lesson.topic, lesson=lesson)
        elif path.startswith('/api/learning/quizzes/'):
            quiz_id = self._extract_id(path, 'quizzes')
            if quiz_id and not self._is_nested(path):
                quiz = Quiz.objects.filter(id=quiz_id).first()
                if quiz:
                    track_event(user, 'quiz_start', topic=quiz.lesson.topic, quiz=quiz)

    @staticmethod
    def _extract_id(path, resource):
        parts = path.strip('/').split('/')
        try:
            idx = parts.index(resource)
            return int(parts[idx + 1])
        except (ValueError, IndexError):
            return None

    @staticmethod
    def _is_nested(path):
        # Detail URLs have the resource id as the last segment.
        parts = path.strip('/').split('/')
        return len(parts) % 2 == 0 and parts[-1].isdigit()
