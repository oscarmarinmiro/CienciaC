from __future__ import unicode_literals

from django.db import models




class Series(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    serie = models.IntegerField()
    index = models.CharField(max_length=100)
    round = models.IntegerField()
    date = models.DateField()
    price = models.FloatField()
    difference = models.FloatField()  # Field renamed to remove unsuitable characters. Field renamed because it started with '%'.
    result = models.IntegerField()
    expert = models.IntegerField()

    def __unicode__(self):
        return 'Serie: ' + str(self.serie) + "->" + self.index + "->" + str(self.round)

    class Meta:
        managed = False
        db_table = 'Series'
        verbose_name_plural = "Series"


class Games(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    experiment = models.CharField(max_length=2)
    serie = models.CharField(max_length=20)
    completada = models.IntegerField()
    encerts = models.IntegerField()
    errors = models.IntegerField()
    temps_total = models.IntegerField()
    data_finalitzacio = models.DateTimeField(blank=True, null=True)

    def __unicode__(self):
        return 'Game: ' + self.experiment + "->" + str(self.serie)

    class Meta:
        managed = False
        db_table = 'Games'
        verbose_name_plural = "Games"

#anyadir campo de localizacion/promo/id por usuario

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
       return 'Nickname: ' + self.nickname

    class Meta:
        managed = False
        db_table = 'Users'
        verbose_name_plural = "Users"


class Rounds(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    game = models.ForeignKey(Games)
    round = models.IntegerField()
    user = models.ForeignKey(Users)
    experiment = models.CharField(max_length=100)
    round_time = models.FloatField()
    decision = models.IntegerField()
    result = models.IntegerField()
    information = models.IntegerField()
    clicks = models.IntegerField()
    price_time = models.FloatField()
    price_5day_time = models.FloatField()
    price_30day_time = models.FloatField()
    intraday_time = models.FloatField()
    expert_time = models.FloatField()
    arrows_time = models.FloatField()
    markets_time = models.FloatField()

    def __unicode__(self):
        return 'Round: ' + self.user.nickname + "->" + str(self.game) + " + Round:" + str(self.round)

    class Meta:
        managed = False
        db_table = 'Rounds'
        verbose_name_plural = "Rounds"




