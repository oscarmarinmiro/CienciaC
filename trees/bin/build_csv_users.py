__author__ = '@oscarmarinmiro @ @outliers_es'

import pprint
import json

FILE_IN = "../assets/mr_banks.json"

FILE_OUT = "../assets/users_sequences.csv"

SEQ_SEPARATOR = ";"
SEPARATOR = ","

with open(FILE_IN, "rb") as file_in:
    with open(FILE_OUT, "wb") as file_out:

        my_data = json.load(file_in)

        for entry in my_data['users']:

            for game in entry['games']:
                rounds = game['rounds']

                if len(rounds) > 0:
                    sequence = []

                    for round in rounds:
                        print str(round[2])
                        sequence.append(str(round[2]))

                    file_out.write(SEQ_SEPARATOR.join(sequence)+SEPARATOR+"1"+"\n")

                        # print str(round[2])
            #         sequence = []
            #         sequence.append(str(fields['result']))
            #
            # file_out.write(SEQ_SEPARATOR.join(sequence)+SEPARATOR+"1"+"\n")


