"""Analytics services: recommendations and summary aggregation."""

from datetime import timedelta

from django.conf import settings
from django.db.models import Avg, Count, F, Max
from django.utils import timezone

from learning.models import Attempt

from .models import DailyStreak, LearningEvent, Recommendation

PERIODS = {'7d': 7, '30d': 30}


def generate_recommendations(student):
    """Rule-based v1: topics with avg score < threshold and >= 1 attempt,
    capped and ordered by lowest score. Replaces this student's active set."""
    from learning.models import Topic

    threshold = settings.RECOMMENDATION_MIN_AVG_SCORE
    max_items = settings.RECOMMENDATION_MAX_ITEMS

    per_topic = (
        Attempt.objects.filter(student=student)
        .values('quiz__lesson__topic')
        .annotate(avg_score=Avg('score'), attempts=Count('id'))
        .filter(attempts__gte=1, avg_score__lt=threshold)
        .order_by('avg_score')[:max_items]
    )

    Recommendation.objects.filter(student=student).delete()
    recs = []
    for row in per_topic:
        topic = Topic.objects.filter(id=row['quiz__lesson__topic']).first()
        if topic is None:
            continue
        recs.append(
            Recommendation(
                student=student,
                topic=topic,
                average_score=round(row['avg_score'], 1),
                recommendation_text=(
                    f'Revise "{topic.name}" — your average score is '
                    f'{row["avg_score"]:.0f}%. Work through the lessons and retry the quiz.'
                ),
            )
        )
    Recommendation.objects.bulk_create(recs)
    return recs


def _streak_count(student) -> int:
    """Consecutive days ending today (or yesterday) with any recorded activity."""
    today = timezone.localdate()
    dates = set(
        DailyStreak.objects.filter(student=student, date__gt=today - timedelta(days=400)).values_list(
            'date', flat=True
        )
    )
    if not dates:
        return 0
    cursor = today if today in dates else today - timedelta(days=1)
    streak = 0
    while cursor in dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def get_active_recommendations(student):
    """Persisted recommendations not older than the TTL."""
    ttl_days = settings.RECOMMENDATION_TTL_DAYS
    cutoff = timezone.now() - timedelta(days=ttl_days)
    return Recommendation.objects.filter(student=student, created_at__gte=cutoff).select_related('topic')


def student_summary(student, period='all'):
    """Aggregated learning summary for one student."""
    events = LearningEvent.objects.filter(student=student)
    since = None
    if period in PERIODS:
        since = timezone.now() - timedelta(days=PERIODS[period])
        events = events.filter(created_at__gte=since)

    totals = events.aggregate(
        total_lessons=Count('id', filter=F('event_type') == 'lesson_view'),
    )
    lessons_completed = events.filter(event_type='lesson_complete').count()
    quizzes_taken = events.filter(event_type='quiz_submit').count()
    ai_questions = events.filter(event_type='ai_tutor_ask').count()

    attempts = Attempt.objects.filter(student=student)
    if period in PERIODS:
        attempts = attempts.filter(attempted_at__gte=since)
    avg_score = attempts.aggregate(a=Avg('score'))['a']

    topics_covered = events.exclude(topic=None).values('topic').distinct().count()
    time_spent_minutes = 0  # duration tracking is client-supplied; kept optional

    return {
        'period': period,
        'total_lessons_viewed': totals['total_lessons'],
        'lessons_completed': lessons_completed,
        'quizzes_taken': quizzes_taken,
        'ai_questions_asked': ai_questions,
        'average_score': round(avg_score, 1) if avg_score is not None else None,
        'topics_covered': topics_covered,
        'current_streak_days': _streak_count(student),
        'time_spent_minutes': time_spent_minutes,
    }


def topic_performance(student):
    """Per-topic average score for one student."""
    rows = (
        Attempt.objects.filter(student=student)
        .values(
            'quiz__lesson__topic__id',
            'quiz__lesson__topic__name',
            'quiz__lesson__topic__level',
        )
        .annotate(
            avg_score=Avg('score'),
            attempts=Count('id'),
            best_score=Max('score'),
        )
        .order_by('avg_score')
    )
    return [
        {
            'topic_id': r['quiz__lesson__topic__id'],
            'topic_name': r['quiz__lesson__topic__name'],
            'level': r['quiz__lesson__topic__level'],
            'average_score': round(r['avg_score'], 1),
            'best_score': round(r['best_score'], 1),
            'attempts': r['attempts'],
        }
        for r in rows
        if r['quiz__lesson__topic__id'] is not None
    ]


def teacher_overview():
    """Cohort-level stats for teachers/admins."""
    from django.contrib.auth import get_user_model

    User = get_user_model()
    now = timezone.now()
    students = User.objects.filter(role='student')

    active_7d = students.filter(learning_events__created_at__gte=now - timedelta(days=7)).distinct().count()
    active_30d = students.filter(learning_events__created_at__gte=now - timedelta(days=30)).distinct().count()

    struggling = (
        Attempt.objects.values('quiz__lesson__topic__id', 'quiz__lesson__topic__name')
        .annotate(avg_score=Avg('score'), attempts=Count('id'))
        .filter(attempts__gte=1)
        .order_by('avg_score')[:5]
    )

    distribution_buckets = {
        '0-49': 0,
        '50-59': 0,
        '60-69': 0,
        '70-79': 0,
        '80-89': 0,
        '90-100': 0,
    }
    for score in Attempt.objects.values_list('score', flat=True):
        if score < 50:
            distribution_buckets['0-49'] += 1
        elif score < 60:
            distribution_buckets['50-59'] += 1
        elif score < 70:
            distribution_buckets['60-69'] += 1
        elif score < 80:
            distribution_buckets['70-79'] += 1
        elif score < 90:
            distribution_buckets['80-89'] += 1
        else:
            distribution_buckets['90-100'] += 1

    return {
        'total_students': students.count(),
        'active_7d': active_7d,
        'active_30d': active_30d,
        'top_struggling_topics': [
            {
                'topic_id': r['quiz__lesson__topic__id'],
                'topic_name': r['quiz__lesson__topic__name'],
                'average_score': round(r['avg_score'], 1),
                'attempts': r['attempts'],
            }
            for r in struggling
            if r['quiz__lesson__topic__id'] is not None
        ],
        'score_distribution': distribution_buckets,
    }
