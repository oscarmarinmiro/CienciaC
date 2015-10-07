__author__ = '@oscarmarinmiro @ @outliers_es'

import json
import pprint
from tree_averages import BeginTree

# REFERENCES
# http://www.cs.jhu.edu/~langmea/resources/lecture_notes/suffix_trees.pdf

FILE_IN = "../assets/average_sequences.csv"

FILE_OUT = "../www/data/averages_con3.json"

SEPARATOR_VALUE = ","

SEPARATOR_PATH = ";"

line_num = 0

# instantiate trees...

my_tree = BeginTree()

with open(FILE_IN, "rb") as file_in:
    for line in file_in:

        line = line.rstrip().decode("utf8")
        (sequence, value) = line.split(SEPARATOR_VALUE)

        fields = value.split(SEPARATOR_PATH)

        count = int(fields[0])
        average = float(fields[1])
        pprint.pprint(sequence)
        pprint.pprint(count)
        pprint.pprint(average)
        print "======"
        # value = float(value)
        # visits = sequence.split(SEPARATOR_PATH)
        #
        # pprint.pprint("=====\nINSERTING")
        # pprint.pprint(visits)

        visits = sequence.split(SEPARATOR_PATH)

        my_tree.insert_node(visits, count, average)

        if line_num % 1000 == 0:
            print "Parseadas %d lineas" % line_num


        line_num += 1

pprint.pprint(my_tree.tree_to_d3())


with open(FILE_OUT,"wb") as file_out:
    json.dump(my_tree.tree_to_d3(), file_out, indent=4)