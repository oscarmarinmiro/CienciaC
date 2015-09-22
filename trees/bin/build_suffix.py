__author__ = '@oscarmarinmiro @ @outliers_es'

import json
import pprint
from tree import BeginTree

# REFERENCES
# http://www.cs.jhu.edu/~langmea/resources/lecture_notes/suffix_trees.pdf

# FILE_IN = "../assets/abracadabra.csv"
#
# FILE_OUT_BEGIN_TREE = "../www/data/abracadabra.json"


# FILE_IN = "../assets/series_sequences.csv"
#
# FILE_OUT_BEGIN_TREE = "../www/data/series_sequences.json"

# FILE_IN = "../assets/users_sequences.csv"
#
# FILE_OUT_BEGIN_TREE = "../www/data/users_sequences.json"

# FILE_IN = "../assets/users_sequences_win.csv"
#
# FILE_OUT_BEGIN_TREE = "../www/data/users_sequences_win.json"

FILE_IN = "../assets/users_sequences_fail.csv"

FILE_OUT_BEGIN_TREE = "../www/data/users_sequences_fail.json"


SEPARATOR_VALUE = ","

SEPARATOR_PATH = ";"

PRUNE = False

MIN_COUNT_FACTOR = 1000.0

SUFFIX = True

line_num = 0

# instantiate trees...

my_tree = BeginTree()

with open(FILE_IN, "rb") as file_in:
    for line in file_in:

        line = line.rstrip().decode("utf8")
        (sequence, value) = line.split(SEPARATOR_VALUE)
        value = int(value)
        visits = sequence.split(SEPARATOR_PATH)

        pprint.pprint("=====\nINSERTING")
        pprint.pprint(visits)

        my_tree.insert_node(visits, value, SUFFIX)

        if line_num % 1000 == 0:
            print "Parseadas %d lineas" % line_num


        line_num += 1


if PRUNE:

    print "Getting prune factor"

    total_count = my_tree.tree["root"]["count"]

    print "Total count: %d" % total_count

    MIN_COUNT = int(total_count/MIN_COUNT_FACTOR)

    print "Min count: %d" % MIN_COUNT

    print "Pruning..."

    my_tree.prune(MIN_COUNT)

    pprint.pprint(my_tree.get_tree_stats())

    print "Pruning end..."

print "Removing lonely ends..."

my_tree.remove_lonely_ends()

print "Removed lonely ends..."

print "Removing lonely sequences.."

my_tree.join_lonelies()
my_tree.join_lonelies()
my_tree.join_lonelies()


print "Removed lonely sequences..."

pprint.pprint(my_tree.tree_to_d3())


with open(FILE_OUT_BEGIN_TREE,"wb") as file_out:
    json.dump(my_tree.tree_to_d3(), file_out, indent=4)