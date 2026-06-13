from django.db import models
from django.conf import settings
from learning.models import Topic

# Create your models here.
class Performance(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE
    )
    average_score = models.FloatField()
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.topic.name} - {self.average_score}"


class Recommendation(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    recommendation_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommendation for {self.student.username}: {self.recommendation_text}"
