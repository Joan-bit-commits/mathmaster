from django.conf import settings
from django.db import models


class Membership(models.Model):
    ROLE_CHOICES = [
        ('owner', 'School Owner'),
        ('admin', 'School Administrator'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
        ('parent', 'Parent / Guardian'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    student_id = models.CharField(max_length=50, blank=True)
    admission_number = models.CharField(max_length=50, blank=True)
    class_level = models.CharField(max_length=20, blank=True)
    class_stream = models.CharField(max_length=50, blank=True)
    parent_email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    last_active_at = models.DateTimeField(null=True, blank=True)
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='memberships_invited',
    )
    preferences = models.JSONField(default=dict, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'school'], name='unique_user_school_membership')
        ]
        ordering = ['school', 'role', 'user__last_name']
        indexes = [
            models.Index(fields=['user', 'school']),
            models.Index(fields=['school', 'role', 'is_active']),
            models.Index(fields=['school', 'class_level', 'is_active']),
        ]

    def __str__(self):
        return f'{self.user.get_full_name()} - {self.role} at {self.school.name}'

    @property
    def can_manage_school(self):
        return self.role in ('owner', 'admin')

    @property
    def can_teach(self):
        return self.role in ('owner', 'admin', 'teacher')

    @property
    def is_student(self):
        return self.role == 'student'
