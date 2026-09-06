from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('ai_tutor', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatsession',
            name='title',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
    ]