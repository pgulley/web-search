# Generated by Django 4.1.3 on 2022-12-15 19:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sources', '0019_alter_source_media_type_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='collection',
            name='public',
            field=models.BooleanField(blank=True, default=True, null=True),
        ),
        migrations.AddIndex(
            model_name='collection',
            index=models.Index(fields=['platform'], name='collection platform'),
        ),
        migrations.AddIndex(
            model_name='source',
            index=models.Index(fields=['platform'], name='source platform'),
        ),
        migrations.AddConstraint(
            model_name='source',
            constraint=models.UniqueConstraint(fields=('name', 'platform', 'url_search_string'), name='unique names within platform'),
        ),
    ]