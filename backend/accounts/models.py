from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (('student', 'Student'), ('teacher', 'Teacher'), ('admin', 'Admin'))

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    current_school = models.ForeignKey(
        'schools.School',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_users',
    )

    def __str__(self):
        return self.username
