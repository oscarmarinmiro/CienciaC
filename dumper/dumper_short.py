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

FILE_OUT = "mr_banks.short.json"

# final data [made of user vector]

django.setup()


# Build user data

my_data = {'users': [], 'series': {}}

for user in Users.objects.all():
    # pprint.pprint(user)
    new_user = {}
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
#
#     for game in [user.partida1, user.partida2, user.partida3, user.partida4]:
#         my_game = {}
#         my_game['exp'] = game.experiment
#         my_game['ser'] = int(game.serie)
#         my_game['com'] = game.completada
#         my_game['cor'] = int(game.encerts)
#         my_game['err'] = int(game.errors)
#         my_game['tt'] = int(game.temps_total)
#
#         # Sometimes users do not finish and field should be checked against None
#
#         my_game['end'] = game.data_finalitzacio.strftime("%Y-%m-%d %H:%M:%S") if game.data_finalitzacio is not None else None
#
#         # Now go with the rounds...
#
#         my_game['rnd'] = []
#
#         for my_round in Rounds.objects.all().filter(game__id = game.id).order_by('round'):
#
#             round_data = []
#
#             # round_data['experiment'] = my_round.experiment
#             # round_data['round_time'] = float(my_round.round_time)
#             # round_data['decision'] = int(my_round.decision)
#             # round_data['result'] = int(my_round.result)
#             # round_data['information'] = int(my_round.information)
#             # round_data['clicks'] = int(my_round.clicks)
#             # round_data['price_time'] = float(my_round.price_time)
#             # round_data['price_5day_time'] = float(my_round.price_5day_time)
#             # round_data['price_30day_time'] = float(my_round.price_30day_time)
#             # round_data['intraday_time'] = float(my_round.intraday_time)
#             # round_data['expert_time'] = float(my_round.expert_time)
#             # round_data['arrows_time'] = float(my_round.arrows_time)
#             # round_data['markets_time'] = float(my_round.markets_time)
#
#             round_data.append(my_round.experiment)
#             round_data.append(float(my_round.round_time))
#             round_data.append(int(my_round.decision))
#             round_data.append(int(my_round.result))
#             round_data.append(int(my_round.information))
#             round_data.append(int(my_round.clicks))
#             round_data.append(float(my_round.price_time))
#             round_data.append(float(my_round.price_5day_time))
#             round_data.append(float(my_round.price_30day_time))
#             round_data.append(float(my_round.intraday_time))
#             round_data.append(float(my_round.expert_time))
#             round_data.append(float(my_round.arrows_time))
#             round_data.append(float(my_round.markets_time))
#
#             my_game['rnd'].append(round_data)
#
#         new_user['gam'].append(my_game)
#
#     my_data['users'].append(new_user)
#
#     pprint.pprint(new_user)
#
# # Now write series
#
# for serie in Series.objects.all().order_by('serie','round'):
#     my_serie = int(serie.serie)
#     if my_serie not in my_data['series']:
#         my_data['series'][my_serie] = {}
#         my_data['series'][my_serie]['idx'] = serie.index
#         my_data['series'][my_serie]['rnd'] = {}
#
#     my_data['series'][my_serie]['rnd'][int(serie.round)] = {'date': serie.date.strftime('%Y-%m-%d'),
#                                                              'price': float(serie.price),
#                                                              'difference': float(serie.difference),
#                                                              'result': int(serie.result),
#                                                              'expert': int(serie.expert)}
#
#
# # Final json dump (indent for debugging purposes, should be removed in production)
#
# with open(FILE_OUT,"wb") as file_out:
#     json.dump(my_data, file_out, separators=(',',':'))


