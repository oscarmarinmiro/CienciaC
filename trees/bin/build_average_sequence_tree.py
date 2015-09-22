__author__ = '@oscarmarinmiro @ @outliers_es'

import pprint
import json

FILE_IN = "../assets/mr_banks.json"

FILE_OUT = "../assets/average_sequences.csv"

SEQ_SEPARATOR = ";"
SEPARATOR = ","

SEQUENCE_WINDOW = 5
MAX_ROUNDS = 25

with open(FILE_IN, "rb") as file_in:

    my_data = json.load(file_in)

    my_struct = {}

    series = my_data['series']

    for number_str, entry in series.items():
        index = int(number_str)

        if index not in my_struct:
            my_struct[index] = {}

        for round_str, round_entry in entry['rounds'].items():
            my_struct[index][int(round_str)] = {'market': round_entry['result'], 'success': 0, 'errors': 0}

    for entry in my_data['users']:

        for game in entry['games']:
            rounds = game['rounds']
            series_number = int(game['series'])

            if len(rounds) > 0:
                sequence = []
                index = 1
                for round in rounds:
                    if round[3] == -1:
                        my_struct[series_number][index]['errors'] += 1
                    else:
                        my_struct[series_number][index]['success'] += 1

                    index += 1

final_series = {}

# # Now, convert success + errors into success rate
#
for number, entry in my_struct.items():
    series_rounds = []
    for round_number in sorted(entry.keys()):
        if round_number < 26:
            struct = entry[round_number]
            struct['success_rate'] = struct['success'] / (struct['errors'] + struct['success'] + 0.0)
            series_rounds.append(struct)

    final_series[number] = series_rounds

pprint.pprint(final_series)

# Now, make windows for every serie and annotate in 'sequences' every success_rate for every sequence

sequences = {}

for serie in sorted(final_series.keys()):
    for i in range(1, MAX_ROUNDS+1):
        my_sequence = (final_series[serie][:i])[-SEQUENCE_WINDOW:]
        print "Serie %d Ronda %d" % (serie,i)
        pprint.pprint(my_sequence)

        s_rate = my_sequence[-1]['success_rate']

        for j in range(0,len(my_sequence)):
            mini_sequence = my_sequence[j:len(my_sequence)+1]

            market_sequence = ";".join([str(entry['market']) for entry in mini_sequence])

            if market_sequence not in sequences:
                sequences[market_sequence] = []

            sequences[market_sequence].append(s_rate)

            print "%s --> %f" % (market_sequence, s_rate)


print "==============="

pprint.pprint(sequences)

sequences_count = {}

# Finally calculate average for every sequence

for sequence, entry in sequences.items():
    sequences[sequence] = sum(entry) / len(entry)
    sequences_count[sequence] = len(entry)

print "*************"

pprint.pprint(sequences)

# And finally output the sequences

with open(FILE_OUT, "wb") as file_out:
    for sequence, entry in sequences.items():
        file_out.write("%s,%d;%f\n" % (sequence, sequences_count[sequence],entry))