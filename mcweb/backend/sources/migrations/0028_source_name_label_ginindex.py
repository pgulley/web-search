# Generated by Django 4.1.13 on 2025-03-04 19:46
# tweaks from https://dev.to/siumhossain/how-to-create-gin-index-in-django-migration-django-search-1310
# and https://pganalyze.com/blog/full-text-search-django-postgres

import django.contrib.postgres.indexes
from django.contrib.postgres.operations import BtreeGinExtension
from django.contrib.postgres.search import SearchVectorField
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sources', '0027_source_last_rescraped_msg'),
    ]

    operations = [
        BtreeGinExtension(),    # added
        migrations.AddField(
            model_name='source',
            name='search_vector',
            field=SearchVectorField(null=True),
        ),
        migrations.AddIndex(
            model_name='source',
            index=django.contrib.postgres.indexes.GinIndex(fields=['search_vector'], name='sources_source_name_label_gin'),
        ),
    ]
