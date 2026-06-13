from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ('student','Student'),
        ('teacher','Teacher'),
        ('admin','Admin')
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )

    def __str__(self):
        return self.username


