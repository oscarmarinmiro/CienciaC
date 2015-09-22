# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('json_dumper', '0002_auto_20150610_1734'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='games',
            options={'managed': False},
        ),
        migrations.AlterModelOptions(
            name='rounds',
            options={'managed': False},
        ),
        migrations.AlterModelOptions(
            name='series',
            options={'managed': False},
        ),
        migrations.AlterModelOptions(
            name='users',
            options={'managed': False},
        ),
    ]
