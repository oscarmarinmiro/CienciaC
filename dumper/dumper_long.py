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

from db.models_old import *

FILE_OUT = "mr_banks.json"

# final data [made of user vector]

django.setup()


# Build user data

my_data = {'users': [], 'series': {}}

for user in Users.objects.all():
    new_user = {}
    new_user['email'] = user.email
    new_user['gender'] = user.genere
    new_user['age_range'] = user.rang_edat
    new_user['education_level'] = user.nivell_estudis
    new_user['nickname'] = user.nickname
    new_user['finished'] = user.acabat
    new_user['final_money'] = user.diners
    new_user['begin_datetime'] = user.data_creacio.strftime("%Y-%m-%d %H:%M:%S")

    # Sometimes users do not finish and field should be checked against None

    if user.data_finalitzacio is not None:
        new_user['end_datetime'] = user.data_finalitzacio.strftime("%Y-%m-%d %H:%M:%S")
    else:
        new_user['end_datetime'] = None

    # Build games and round info

    new_user['games'] = []

    for game in [user.partida1, user.partida2, user.partida3, user.partida4]:
        my_game = {}
        my_game['experiment'] = game.experiment
        my_game['series'] = int(game.serie)
        my_game['completed'] = game.completada
        my_game['right_answers'] = int(game.encerts)
        my_game['wrong_answers'] = int(game.errors)
        my_game['elapsed_time'] = int(game.temps_total)

        # Sometimes users do not finish and field should be checked against None

        my_game['end_datetime'] = game.data_finalitzacio.strftime("%Y-%m-%d %H:%M:%S") if game.data_finalitzacio is not None else None

        # Now go with the rounds...

        my_game['rounds'] = []

        for my_round in Rounds.objects.all().filter(game__id = game.id).order_by('round'):

            round_data = []

            # round_data['experiment'] = my_round.experiment
            # round_data['round_time'] = float(my_round.round_time)
            # round_data['decision'] = int(my_round.decision)
            # round_data['result'] = int(my_round.result)
            # round_data['information'] = int(my_round.information)
            # round_data['clicks'] = int(my_round.clicks)
            # round_data['price_time'] = float(my_round.price_time)
            # round_data['price_5day_time'] = float(my_round.price_5day_time)
            # round_data['price_30day_time'] = float(my_round.price_30day_time)
            # round_data['intraday_time'] = float(my_round.intraday_time)
            # round_data['expert_time'] = float(my_round.expert_time)
            # round_data['arrows_time'] = float(my_round.arrows_time)
            # round_data['markets_time'] = float(my_round.markets_time)

            round_data.append(my_round.experiment)
            round_data.append(float(my_round.round_time))
            round_data.append(int(my_round.decision))
            round_data.append(int(my_round.result))
            round_data.append(int(my_round.information))
            round_data.append(int(my_round.clicks))
            round_data.append(float(my_round.price_time))
            round_data.append(float(my_round.price_5day_time))
            round_data.append(float(my_round.price_30day_time))
            round_data.append(float(my_round.intraday_time))
            round_data.append(float(my_round.expert_time))
            round_data.append(float(my_round.arrows_time))
            round_data.append(float(my_round.markets_time))

            my_game['rounds'].append(round_data)

        new_user['games'].append(my_game)

    my_data['users'].append(new_user)

    pprint.pprint(new_user)

# Now write series

for serie in Series.objects.all().order_by('serie','round'):
    my_serie = int(serie.serie)
    if my_serie not in my_data['series']:
        my_data['series'][my_serie] = {}
        my_data['series'][my_serie]['index_name'] = serie.index
        my_data['series'][my_serie]['rounds'] = {}

    my_data['series'][my_serie]['rounds'][int(serie.round)] = {'date': serie.date.strftime('%Y-%m-%d'),
                                                             'price': float(serie.price),
                                                             'difference': float(serie.difference),
                                                             'result': int(serie.result),
                                                             'expert': int(serie.expert)}


# Final json dump (indent for debugging purposes, should be removed in production)

with open(FILE_OUT,"wb") as file_out:
    json.dump(my_data, file_out, indent=4)


