__author__ = '@oscarmarinmiro @ @outliers_es'

import pprint
import json

FILE_IN = "../assets/mr_banks.json"

FILE_OUT = "../assets/users_sequences_win.csv"

SEQ_SEPARATOR = ";"
SEPARATOR = ","

SEQUENCE_WINDOW = 5

with open(FILE_IN, "rb") as file_in:
    with open(FILE_OUT, "wb") as file_out:

        my_data = json.load(file_in)

        series = my_data['series']

        for entry in my_data['users']:

            for game in entry['games']:
                rounds = game['rounds']
                serie_name = str(game['series'])

                if len(rounds) > 0:
                    sequence = []

                    index = 0

                    for round in rounds:
                        #sequence.append(str(round[2]))
                        sequence.append(str(series[serie_name]['rounds'][str(index+1)]['result']))

                        # WIN SEQUENCE

                        if round[3] == 1 and index >= (SEQUENCE_WINDOW-1):
                            this_sequence = sequence[-SEQUENCE_WINDOW:]
                            file_out.write(SEQ_SEPARATOR.join(this_sequence)+SEPARATOR+"1"+"\n")

                        index+=1


                        # print str(round[2])
            #         sequence = []
            #         sequence.append(str(fields['result']))
            #
            # file_out.write(SEQ_SEPARATOR.join(sequence)+SEPARATOR+"1"+"\n")


