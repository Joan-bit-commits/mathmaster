import secrets

from django.conf import settings
from django.db import models
from django.utils import timezone


def default_expires_at():
    return timezone.now() + timezone.timedelta(days=7)


class Invitation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('expired', 'Expired'),
        ('revoked', 'Revoked'),
    ]

    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    role = models.CharField(max_length=20)
    token = models.CharField(max_length=64, unique=True, db_index=True)
    class_level = models.CharField(max_length=20, blank=True)
    class_stream = models.CharField(max_length=50, blank=True)
    admission_number = models.CharField(max_length=50, blank=True)
    target_class = models.ForeignKey('classes.SchoolClass', on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    message = models.TextField(blank=True, max_length=500)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    expires_at = models.DateTimeField(default=default_expires_at)
    accepted_at = models.DateTimeField(null=True, blank=True)
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invitations_accepted',
    )
    revoked_at = models.DateTimeField(null=True, blank=True)
    revoked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invitations_revoked',
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='invitations_sent'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['school', 'email', 'role', 'status'], name='unique_school_invitation_status'
            )
        ]
        ordering = ['-created_at']
        indexes = [models.Index(fields=['school', 'status'])]

    def is_valid(self):
        return self.status == 'pending' and self.expires_at > timezone.now()

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
