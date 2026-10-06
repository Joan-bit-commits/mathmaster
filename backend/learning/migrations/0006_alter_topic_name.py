from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('learning', '0005_school_required'),
    ]

    operations = [
        migrations.AlterField(
            model_name='topic',
            name='name',
            field=models.CharField(max_length=100),
        ),
    ]