"""Cache invalidation for the topic list cache when content is written."""

from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from learning.models import Lesson, Question, Quiz, Topic

TOPIC_LIST_CACHE_KEY = 'topics:list:v1'


def invalidate_topic_cache(*args, **kwargs):
    cache.delete(TOPIC_LIST_CACHE_KEY)


for model in (Topic, Lesson, Quiz, Question):
    post_save.connect(invalidate_topic_cache, sender=model, dispatch_uid=f'{model.__name__}-cache')
    post_delete.connect(invalidate_topic_cache, sender=model, dispatch_uid=f'{model.__name__}-cache-del')
