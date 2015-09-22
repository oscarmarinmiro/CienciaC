__author__ = '@oscarmarinmiro @ @outliers_es'

import pprint

FILE_GAMES = "../assets/Games.csv"

FILE_ROUNDS = "../assets/Rounds.csv"

FILE_OUT = "../assets/NewGames.csv"


games_to_users = {}

with open(FILE_ROUNDS, "rb") as file_in:
    for line in file_in:
        line = line.rstrip()
        fields = line.split(";")
        game = int(fields[1])
        user = int(fields[3])

        games_to_users[game] = user

pprint.pprint(games_to_users)

with open(FILE_GAMES, "rb") as file_in:
    with open(FILE_OUT, "wb") as file_out:
        for line in file_in:
            line = line.rstrip()
            fields = line.split(";")
            game = int(fields[0])
            if game in games_to_users:
                fields[3] = str(games_to_users[int(fields[0])])
            else:
                fields[3] = str(-1)
            new_line = ";".join(fields)
            pprint.pprint(line)
            pprint.pprint(new_line)


            file_out.write(new_line+"\n")
