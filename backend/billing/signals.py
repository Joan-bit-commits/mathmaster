from django.db.models.signals import post_save
from django.dispatch import receiver

from ai_tutor.models import ChatMessage

from .services import track_usage


@receiver(post_save, sender=ChatMessage)
def track_ai_question(sender, instance, created, **kwargs):
    if created and instance.role == 'user' and instance.school_id:
        track_usage(instance.school, 'ai_questions', metadata={'session_id': str(instance.session_id)})
