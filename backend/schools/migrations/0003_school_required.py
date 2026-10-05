from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('schools', '0002_default_school_for_existing_users'),
        ('learning', '0004_attempt_school_lesson_school_question_school_and_more'),
        ('curriculum', '0004_document_school_documentchatsession_school_and_more'),
        ('ai_tutor', '0003_chatmessage_school_chatsession_school'),
        ('analytics', '0003_dailystreak_school_learningevent_school_and_more'),
    ]
    operations = []