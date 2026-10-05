from django.conf import settings
from django.db import models

from learning.models import Lesson, Question, Quiz, Topic
from schools.managers import SchoolScopedManager


class LearningEvent(models.Model):
    school = models.ForeignKey('schools.School', on_delete=models.PROTECT, related_name='learning_events')
    EVENT_TYPES = [
        ('lesson_view', 'Lesson View'),
        ('lesson_complete', 'Lesson Complete'),
        ('quiz_start', 'Quiz Start'),
        ('quiz_submit', 'Quiz Submit'),
        ('ai_tutor_ask', 'AI Tutor Ask'),
        ('login', 'Login'),
        ('register', 'Register'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='learning_events',
    )
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True)
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True)
    quiz = models.ForeignKey(Quiz, on_delete=models.SET_NULL, null=True, blank=True)
    question = models.ForeignKey(Question, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'event_type']),
            models.Index(fields=['student', 'created_at']),
        ]

    def __str__(self):
        return f'{self.student.username} {self.event_type} @ {self.created_at}'

    objects = SchoolScopedManager()


class DailyStreak(models.Model):
    """Denormalized per-day activity for fast streak/summary reads."""

    school = models.ForeignKey('schools.School', on_delete=models.PROTECT, related_name='daily_streaks')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='daily_streaks',
    )
    date = models.DateField(db_index=True)
    lessons_completed = models.PositiveIntegerField(default=0)
    quizzes_passed = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['student', 'school', 'date'], name='unique_student_school_streak_date')
        ]
        ordering = ['-date']

    def __str__(self):
        return f'{self.student.username} {self.date}: {self.lessons_completed}L/{self.quizzes_passed}Q'

    objects = SchoolScopedManager()


class Performance(models.Model):
    school = models.ForeignKey('schools.School', on_delete=models.PROTECT, related_name='performances')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='performances',
    )
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    average_score = models.FloatField()
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.student.username} - {self.topic.name} - {self.average_score}'

    objects = SchoolScopedManager()


class Recommendation(models.Model):
    school = models.ForeignKey('schools.School', on_delete=models.PROTECT, related_name='recommendations')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recommendations',
    )
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, null=True, blank=True)
    recommendation_text = models.TextField()
    average_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Recommendation for {self.student.username}: {self.recommendation_text}'

    objects = SchoolScopedManager()
