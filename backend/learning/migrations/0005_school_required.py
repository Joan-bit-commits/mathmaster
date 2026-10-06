from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('learning', '0004_attempt_school_lesson_school_question_school_and_more'), ('schools', '0003_school_required')]
    operations = [
        migrations.AlterField(model_name='topic', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='topics', to='schools.school')),
        migrations.AlterField(model_name='lesson', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='lessons', to='schools.school')),
        migrations.AlterField(model_name='quiz', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='quizzes', to='schools.school')),
        migrations.AlterField(model_name='question', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='questions', to='schools.school')),
        migrations.AlterField(model_name='attempt', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='attempts', to='schools.school')),
    ]