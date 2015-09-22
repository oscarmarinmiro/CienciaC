__author__ = '@oscarmarinmiro @ @outliers_es'


import json
import pprint

FILE_IN = "../assets/mr_banks.json"

FILE_OUT = "../assets/series_sequences.csv"

SEQ_SEPARATOR = ";"
SEPARATOR = ","

with open(FILE_IN, "rb") as file_in:
    with open(FILE_OUT, "wb") as file_out:

        my_data = json.load(file_in)

        for key, entry in my_data['series'].items():

            sequence = []

            for round, fields in entry['rounds'].items():
                sequence.append(str(fields['result']))

            file_out.write(SEQ_SEPARATOR.join(sequence)+SEPARATOR+"1"+"\n")


