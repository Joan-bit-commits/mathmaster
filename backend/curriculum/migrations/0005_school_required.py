from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('curriculum', '0004_document_school_documentchatsession_school_and_more'), ('schools', '0003_school_required')]
    operations = [
        migrations.AlterField(model_name='document', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='documents', to='schools.school')),
        migrations.AlterField(model_name='documentchunk', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='document_chunks', to='schools.school')),
        migrations.AlterField(model_name='documentchatsession', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='document_chat_sessions', to='schools.school')),
        migrations.AlterField(model_name='documentquestion', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='document_questions', to='schools.school')),
        migrations.AlterField(model_name='scanjob', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='scan_jobs', to='schools.school')),
    ]