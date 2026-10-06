from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('ai_tutor', '0003_chatmessage_school_chatsession_school'), ('schools', '0003_school_required')]
    operations = [
        migrations.AlterField(model_name='chatsession', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='tutor_sessions', to='schools.school')),
        migrations.AlterField(model_name='chatmessage', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='tutor_messages', to='schools.school')),
    ]