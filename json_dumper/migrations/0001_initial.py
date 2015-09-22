# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Games',
            fields=[
                ('id', models.IntegerField(serialize=False, primary_key=True)),
                ('experiment', models.CharField(max_length=2)),
                ('completada', models.IntegerField()),
                ('encerts', models.IntegerField()),
                ('errors', models.IntegerField()),
                ('temps_total', models.IntegerField()),
                ('data_finalitzacio', models.DateTimeField(null=True, blank=True)),
            ],
            options={
                'db_table': 'Games',
                'managed': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Rounds',
            fields=[
                ('id', models.IntegerField(serialize=False, primary_key=True)),
                ('round', models.IntegerField()),
                ('experiment', models.CharField(max_length=100)),
                ('round_time', models.FloatField()),
                ('decision', models.IntegerField()),
                ('result', models.IntegerField()),
                ('information', models.IntegerField()),
                ('clicks', models.IntegerField()),
                ('price_time', models.FloatField()),
                ('price_5day_time', models.FloatField()),
                ('price_30day_time', models.FloatField()),
                ('intraday_time', models.FloatField()),
                ('expert_time', models.FloatField()),
                ('arrows_time', models.FloatField()),
                ('markets_time', models.FloatField()),
            ],
            options={
                'db_table': 'Rounds',
                'managed': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Series',
            fields=[
                ('id', models.IntegerField(serialize=False, primary_key=True)),
                ('serie', models.IntegerField()),
                ('index', models.CharField(max_length=100)),
                ('round', models.IntegerField()),
                ('date', models.DateField()),
                ('price', models.FloatField()),
                ('field_difference', models.FloatField(db_column='%difference')),
                ('result', models.IntegerField()),
                ('expert', models.IntegerField()),
            ],
            options={
                'db_table': 'Series',
                'managed': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Users',
            fields=[
                ('id', models.IntegerField(serialize=False, primary_key=True)),
                ('email', models.CharField(max_length=300)),
                ('genere', models.CharField(max_length=1)),
                ('rang_edat', models.CharField(max_length=20)),
                ('nivell_estudis', models.CharField(max_length=100)),
                ('nickname', models.CharField(max_length=100)),
                ('pr0', models.IntegerField()),
                ('pr1', models.IntegerField()),
                ('pr2', models.IntegerField()),
                ('pr3', models.IntegerField()),
                ('pr4', models.IntegerField()),
                ('pr5', models.IntegerField()),
                ('prfinal0', models.IntegerField(null=True, blank=True)),
                ('prfinal1', models.IntegerField(null=True, blank=True)),
                ('prfinal2', models.IntegerField(null=True, blank=True)),
                ('prfinal3', models.IntegerField(null=True, blank=True)),
                ('prfinal4', models.IntegerField(null=True, blank=True)),
                ('diners', models.IntegerField()),
                ('data_creacio', models.DateTimeField()),
                ('data_finalitzacio', models.DateTimeField(null=True, blank=True)),
                ('acabat', models.IntegerField()),
            ],
            options={
                'db_table': 'Users',
                'managed': False,
            },
            bases=(models.Model,),
        ),
    ]
