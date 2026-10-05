from django.db import migrations
from django.utils.text import slugify


SCHOOL_SCOPED_MODELS = [
    ('learning', 'Topic'),
    ('learning', 'Lesson'),
    ('learning', 'Quiz'),
    ('learning', 'Question'),
    ('learning', 'Attempt'),
    ('curriculum', 'Document'),
    ('curriculum', 'DocumentChunk'),
    ('curriculum', 'DocumentChatSession'),
    ('curriculum', 'DocumentQuestion'),
    ('curriculum', 'ScanJob'),
    ('ai_tutor', 'ChatSession'),
    ('ai_tutor', 'ChatMessage'),
    ('analytics', 'LearningEvent'),
    ('analytics', 'DailyStreak'),
    ('analytics', 'Performance'),
    ('analytics', 'Recommendation'),
]


def create_default_schools(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    School = apps.get_model('schools', 'School')
    Membership = apps.get_model('memberships', 'Membership')
    used_slugs = set(School.objects.values_list('slug', flat=True))
    schools = []

    for user in User.objects.all().iterator():
        base_slug = (slugify(f'{user.username}-personal') or f'user-{user.pk}')[:90]
        candidate = base_slug
        counter = 1
        while candidate in used_slugs:
            candidate = f'{base_slug}-{counter}'
            counter += 1
        used_slugs.add(candidate)
        full_name = ' '.join(
            part for part in (user.first_name, user.last_name) if part
        ).strip() or user.username
        school = School.objects.create(
            name=f"{full_name}'s Personal Learning",
            slug=candidate,
            contact_email=user.email or f'user-{user.pk}@invalid.mathmaster.app',
            school_type='other',
            created_by_id=user.pk,
        )
        Membership.objects.create(user_id=user.pk, school_id=school.pk, role='owner')
        User.objects.filter(pk=user.pk).update(current_school_id=school.pk)
        schools.append(school)

        for app_label, model_name in SCHOOL_SCOPED_MODELS:
            Model = apps.get_model(app_label, model_name)
            field_names = {field.name for field in Model._meta.fields}
            for owner_field in ('created_by', 'owner', 'user', 'student', 'author', 'teacher'):
                if owner_field in field_names:
                    Model.objects.filter(**{f'{owner_field}_id': user.pk, 'school__isnull': True}).update(school_id=school.pk)
                    break

    fallback = schools[0] if schools else None
    if fallback:
        for app_label, model_name in SCHOOL_SCOPED_MODELS:
            Model = apps.get_model(app_label, model_name)
            Model.objects.filter(school__isnull=True).update(school_id=fallback.pk)


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0002_user_current_school'),
        ('schools', '0001_initial'),
        ('memberships', '0001_initial'),
        ('learning', '0004_attempt_school_lesson_school_question_school_and_more'),
        ('curriculum', '0004_document_school_documentchatsession_school_and_more'),
        ('ai_tutor', '0003_chatmessage_school_chatsession_school'),
        ('analytics', '0003_dailystreak_school_learningevent_school_and_more'),
    ]
    operations = [migrations.RunPython(create_default_schools, migrations.RunPython.noop)]