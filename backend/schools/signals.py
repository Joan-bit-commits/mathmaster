from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.text import slugify

from ai_tutor.models import ChatMessage, ChatSession
from analytics.models import DailyStreak, LearningEvent, Performance, Recommendation
from curriculum.models import Document, DocumentChatSession, DocumentChunk, DocumentQuestion, ScanJob
from learning.models import Attempt, Lesson, Question, Quiz, Topic

from .models import School

SCHOOL_SCOPED_MODELS = (
    Topic,
    Lesson,
    Quiz,
    Question,
    Attempt,
    Document,
    DocumentChunk,
    DocumentChatSession,
    DocumentQuestion,
    ScanJob,
    ChatSession,
    ChatMessage,
    LearningEvent,
    DailyStreak,
    Performance,
    Recommendation,
)


def _personal_school(user):
    if user.current_school_id:
        return user.current_school
    base = (slugify(f'{user.username}-personal') or f'user-{user.pk}')[:90]
    slug = base
    counter = 1
    while School.objects.filter(slug=slug).exists():
        slug = f'{base}-{counter}'
        counter += 1
    school = School.objects.create(
        name=f"{user.get_full_name() or user.username}'s Personal Learning",
        slug=slug,
        contact_email=user.email or f'user-{user.pk}@invalid.mathmaster.app',
        school_type='other',
        created_by=user,
    )
    user.current_school = school
    user.save(update_fields=['current_school'])
    from memberships.models import Membership

    Membership.objects.get_or_create(user=user, school=school, defaults={'role': 'owner'})
    return school


@receiver(pre_save)
def resolve_legacy_school(sender, instance, **kwargs):
    if sender not in SCHOOL_SCOPED_MODELS or instance.school_id:
        return
    for parent_name in ('topic', 'lesson', 'quiz', 'document', 'session'):
        parent = getattr(instance, parent_name, None)
        # Only treat it as a FK parent when it's actually a model instance
        # with a school_id — plain fields like ChatSession.topic are strings
        # and would crash on parent.school_id.
        if parent is not None and not isinstance(parent, (str, int, float, bool, list, dict)) and getattr(parent, 'school_id', None):
            instance.school_id = parent.school_id
            return
    for owner_name in ('created_by', 'owner', 'user', 'student', 'author', 'teacher'):
        owner = getattr(instance, owner_name, None)
        if owner:
            instance.school = _personal_school(owner)
            return
    from django.contrib.auth import get_user_model

    fallback_user = get_user_model().objects.order_by('id').first()
    if fallback_user:
        instance.school = _personal_school(fallback_user)
