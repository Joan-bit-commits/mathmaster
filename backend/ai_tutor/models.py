from django.conf import settings
from django.db import models

from schools.managers import SchoolScopedManager


class ChatSession(models.Model):
    school = models.ForeignKey('schools.School', on_delete=models.PROTECT, related_name='tutor_sessions')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_sessions',
    )
    topic = models.CharField(max_length=200, blank=True, default='')
    title = models.CharField(max_length=200, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Session {self.id} for {self.student.username}'

    objects = SchoolScopedManager()


class ChatMessage(models.Model):
    school = models.ForeignKey('schools.School', on_delete=models.PROTECT, related_name='tutor_messages')
    ROLE_CHOICES = [('user', 'User'), ('assistant', 'Assistant')]

    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.role}: {self.content[:50]}'

    objects = SchoolScopedManager()
