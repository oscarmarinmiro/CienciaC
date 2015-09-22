from __future__ import unicode_literals

from django.db import models

class Series(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    index_name = models.CharField(max_length=100)
    trend = models.FloatField()
    ups = models.FloatField()

    def __unicode__(self):
        return 'Serie: ' + str(self.id) + "->" + self.index_name

    class Meta:
        managed = False
        db_table = 'Series'
        verbose_name_plural = "Series"

class SeriesPoints(models.Model):
    id = models.IntegerField(primary_key=True)
    series = models.ForeignKey(Series)
    round = models.IntegerField()
    date = models.DateField()
    price = models.FloatField()
    result = models.IntegerField()
    expert_advice = models.IntegerField()


    def __unicode__(self):
        return 'SeriePoint: ' + str(self.series) + "->" + str(self.round)

    class Meta:
        managed = False
        db_table = 'SeriesPoints'
        verbose_name_plural = "SeriesPoints"

class Users(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    email = models.CharField(max_length=300)
    gender = models.CharField(max_length=1)
    age_range = models.CharField(max_length=20)
    education_level = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100)
    question_1 = models.IntegerField()
    question_2 = models.IntegerField()
    question_3 = models.IntegerField()
    question_4 = models.IntegerField()
    question_5 = models.IntegerField()
    question_6 = models.IntegerField()
    question_7 = models.IntegerField()
    question_8 = models.IntegerField()
    question_9 = models.IntegerField()
    question_10 = models.IntegerField()
    question_11 = models.IntegerField()
    score = models.IntegerField()
    init_date = models.DateTimeField()
    end_date = models.DateTimeField()
    finished = models.IntegerField()


    def __unicode__(self):
       return 'Nickname: ' + str(self.nickname)

    class Meta:
        # managed = False
        db_table = 'Users'
        verbose_name_plural = "Users"


class Games(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    tag = models.CharField(max_length=100)
    experiment = models.CharField(max_length=2)
    user = models.ForeignKey(Users)
    series = models.ForeignKey(Series)
    completed = models.IntegerField()
    correct_answers = models.IntegerField()
    errors = models.IntegerField()
    total_time = models.IntegerField()
    end_date = models.DateTimeField(blank=True, null=True)

    def __unicode__(self):
        return 'Game: ' + "->" + self.tag + "->" + str(self.user) + "->" + str(self.series)

    class Meta:
        # managed = False
        db_table = 'Games'
        verbose_name_plural = "Games"



class Rounds(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    game = models.ForeignKey(Games)
    round = models.IntegerField()
    time = models.FloatField()
    decision = models.IntegerField()
    result = models.IntegerField()
    information_consulted = models.IntegerField()
    clicks = models.IntegerField()
    info_daily_price_time = models.FloatField()
    info_5days_average_time = models.FloatField()
    info_30days_average_time = models.FloatField()
    info_intraday_time = models.FloatField()
    info_expert_time = models.FloatField()
    info_arrows_time = models.FloatField()
    info_world_markets_time = models.FloatField()

    def __unicode__(self):
        return 'Round: ' + str(self.id) + "->" + str(self.game) + " + Round:" + str(self.round)

    class Meta:
        db_table = 'Rounds'
        verbose_name_plural = "Rounds"




