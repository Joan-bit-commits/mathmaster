from django.core.exceptions import PermissionDenied
from django.utils import timezone

from .models import UsageRecord


def track_usage(school, metric, quantity=1, metadata=None):
    period = timezone.now().date().replace(day=1)
    record, created = UsageRecord.objects.get_or_create(
        school=school,
        metric=metric,
        period=period,
        defaults={'quantity': quantity, 'metadata': metadata or {}},
    )
    if not created:
        record.quantity += quantity
        if metadata:
            record.metadata.update(metadata)
        record.save(update_fields=['quantity', 'metadata'])
    return record


def get_current_usage(school, metric):
    period = timezone.now().date().replace(day=1)
    record = UsageRecord.objects.filter(school=school, metric=metric, period=period).first()
    return record.quantity if record else 0


def get_limit(school, metric):
    subscription = getattr(school, 'subscription', None) if school else None
    if not subscription or subscription.status not in ('trialing', 'active'):
        return 0
    return {
        'students': subscription.plan.max_students,
        'teachers': subscription.plan.max_teachers,
        'documents': subscription.plan.max_documents,
        'ai_questions': subscription.plan.max_ai_questions_per_month,
        'storage_gb': subscription.plan.storage_gb,
    }.get(metric)


def check_quota(school, action):
    if not school:
        raise PermissionDenied('No school selected.')
    subscription = getattr(school, 'subscription', None)
    if not subscription or subscription.status not in ('trialing', 'active'):
        raise PermissionDenied('No active subscription. Please subscribe to continue.')
    if (
        subscription.status == 'trialing'
        and subscription.trial_ends_at
        and subscription.trial_ends_at < timezone.now()
    ):
        raise PermissionDenied('Your trial has expired. Please subscribe to continue.')

    checks = {
        'invite_student': ('students', 'student'),
        'invite_teacher': ('teachers', 'teacher'),
        'upload_document': ('documents', None),
        'ask_ai_question': ('ai_questions', None),
    }
    if action not in checks:
        return True
    metric, role = checks[action]
    limit = get_limit(school, metric)
    if limit is None:
        return True
    if role:
        from memberships.models import Membership

        current = Membership.objects.filter(school=school, role=role, is_active=True).count()
    else:
        current = get_current_usage(school, metric)
    if current >= limit:
        raise PermissionDenied(f'Plan limit reached: {metric}. You have {current}/{limit}.')
    return True


def get_usage_summary(school):
    from memberships.models import Membership

    metrics = [
        (
            'students',
            'Students',
            Membership.objects.filter(school=school, role='student', is_active=True).count(),
        ),
        (
            'teachers',
            'Teachers',
            Membership.objects.filter(school=school, role='teacher', is_active=True).count(),
        ),
        ('documents', 'Documents', school.documents.count()),
        ('ai_questions', 'AI Questions (this month)', get_current_usage(school, 'ai_questions')),
    ]
    return [
        {'metric': key, 'label': label, 'used': used, 'limit': get_limit(school, key)}
        for key, label, used in metrics
    ]
