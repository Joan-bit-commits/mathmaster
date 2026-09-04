"""Event tracking helpers: manual track_event + per-day streak maintenance."""

import logging
from datetime import date

from django.db.models import F

from .models import DailyStreak, LearningEvent

logger = logging.getLogger(__name__)


def track_event(
    student, event_type, topic=None, lesson=None, quiz=None, question=None, metadata=None, commit_streak=True
):
    """Record a LearningEvent and bump the student's DailyStreak row.

    Pass commit_streak=False for event types that shouldn't count as activity
    (currently none, so defaults to True). Returns the created event.
    """
    event = LearningEvent.objects.create(
        student=student,
        event_type=event_type,
        topic=topic,
        lesson=lesson,
        quiz=quiz,
        question=question,
        metadata=metadata or {},
    )
    if commit_streak:
        streak, _ = DailyStreak.objects.get_or_create(student=student, date=date.today())
        update_fields = []
        if event_type == 'lesson_complete':
            streak.lessons_completed = F('lessons_completed') + 1
            update_fields.append('lessons_completed')
        elif event_type == 'quiz_submit':
            passed = 1 if (metadata or {}).get('score', 0) >= 50 else 0
            streak.quizzes_passed = F('quizzes_passed') + passed
            update_fields.append('quizzes_passed')
        if update_fields:
            streak.save(update_fields=update_fields)
    return event
