from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('analytics', '0003_dailystreak_school_learningevent_school_and_more'), ('schools', '0003_school_required')]
    operations = [
        migrations.AlterField(model_name='learningevent', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='learning_events', to='schools.school')),
        migrations.AlterField(model_name='dailystreak', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='daily_streaks', to='schools.school')),
        migrations.AlterField(model_name='performance', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='performances', to='schools.school')),
        migrations.AlterField(model_name='recommendation', name='school', field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='recommendations', to='schools.school')),
    ]