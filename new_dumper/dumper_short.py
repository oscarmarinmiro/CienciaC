__author__ = '@oscarmarinmiro @ @outliers_es'

import os
import sys
import pprint
import json
import django

# Script to dump Mr_Banks DB

# Append path for settings.py [for database connection]

sys.path.append("../CienciaC")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")

# Model import [BEWARE that models.py from 'json_dumper' app should be copied here, otherwise model import do not work

from db.models import *

FILE_OUT = "mr_banks.short.2.json"

# final data [made of user vector]

django.setup()


# Build user data

my_data = {'users': [], 'series': {}}

for user in Users.objects.all():
    # pprint.pprint(user)
    new_user = {}
    new_user['id'] = user.id
    new_user['eml'] = user.email
    new_user['gen'] = user.gender
    new_user['agr'] = user.age_range
    new_user['ed'] = user.education_level
    new_user['nam'] = user.nickname
    new_user['fin'] = user.finished
    new_user['sco'] = user.score
    new_user['ini'] = user.init_date.strftime("%Y-%m-%d %H:%M:%S")

    # Sometimes users do not finish and field should be checked against None

    if user.end_date is not None:
        new_user['end'] = user.end_date.strftime("%Y-%m-%d %H:%M:%S")
    else:
        new_user['end'] = None

    # Build games and round info

    new_user['gam'] = []

    user_games = Games.objects.filter(user = user)

    for game in user_games:
        my_game = {}
        my_game['tag'] = game.tag
        my_game['exp'] = game.experiment
        my_game['ser'] = int(game.series_id)
        my_game['com'] = game.completed
        my_game['cor'] = int(game.correct_answers)
        my_game['err'] = int(game.errors)
        my_game['tt'] = int(game.total_time)
        my_game['end_date'] = game.end_date.strftime("%Y-%m-%d %H:%M:%S")

        my_game['rnd'] = []

        for my_round in Rounds.objects.all().filter(game = game).order_by('round'):
            round_data = []
            round_data.append(int(my_round.round))
            round_data.append(float(my_round.time))
            round_data.append(int(my_round.decision))
            round_data.append(int(my_round.result))
            round_data.append(int(my_round.information_consulted))
            round_data.append(int(my_round.clicks))
            round_data.append(float(my_round.info_daily_price_time))
            round_data.append(float(my_round.info_5days_average_time))
            round_data.append(float(my_round.info_30days_average_time))
            round_data.append(float(my_round.info_intraday_time))
            round_data.append(float(my_round.info_expert_time))
            round_data.append(float(my_round.info_arrows_time))
            round_data.append(float(my_round.info_world_markets_time))

            my_game['rnd'].append(round_data)

        new_user['gam'].append(my_game)

    my_data['users'].append(new_user)

    pprint.pprint(new_user)
#
# # Now write series
#

print "SERIES..."

for serie in Series.objects.all().order_by('id'):
    my_serie = int(serie.id)
    index_name = serie.index_name
    trend = serie.trend
    ups = serie.ups

    if my_serie not in my_data['series']:
        my_data['series'][my_serie] = {}
        my_data['series'][my_serie]['idx'] = my_serie
        my_data['series'][my_serie]['trd'] = trend
        my_data['series'][my_serie]['ups'] = ups
        my_data['series'][my_serie]['rnd'] = {}

    for point in SeriesPoints.objects.all().filter(series = serie).order_by('round'):
        my_data['series'][my_serie]['rnd'][int(point.round)] = {'date': point.date.strftime('%Y-%m-%d'),
                                                                 'price': float(point.price),
                                                                 'result': int(point.result),
                                                                 'expert': int(point.expert_advice)}



# Final json dump (indent for debugging purposes, should be removed in production)

with open(FILE_OUT,"wb") as file_out:
    json.dump(my_data, file_out, indent = 4, separators = (',',':'))


