globals().clear()

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sqlalchemy import create_engine
import json
import ValuesExperiment  # Get colours

host = "localhost:3306"
username = "root"
password = "root"
dbname = "dstl"
mysqlServer = 'mysql+pymysql://root:root@localhost:3306/test_db'

# mysqlServer ='mysql+pymysql://'+username+':'+password+'@'+host+'/'+dbname
# mysqlServer = 'mysql+pymysql://root:@localhost:3308/dstlProlific'
# mysqlServer = 'mysql+pymysql://root:root@localhost:3306/dstl'

engine = create_engine(mysqlServer)

'''SECTION FOR USERSPROLIFIC'''
usersprolific = pd.read_sql_query('SELECT * FROM usersprolific where completed = 1 ', engine)
# usersprolific = pd.read_sql_query('SELECT * FROM usersprolific', engine)
pd.set_option("display.max_colwidth", None)

# special cases
arrayColumns = ["colours", "category_colour_association", "shortMonitoringTask", "longMonitoringTask"]


# usersprolific[['category_colour', 'order_trials_12','order_trials_24']] .apply( parseCategoryLearning , axis=1 )
def categories_color_relationship(cats):
    categories = json.loads(cats)
    # print(ValuesExperiment.Categories.keys())
    trialsAcostado = []
    for key in ValuesExperiment.Categories:
        colorForCategory = categories.get(key)
        if colorForCategory:
            trialsAcostado.append(colorForCategory)
        else:
            trialsAcostado.append('NA')

    return pd.Series(trialsAcostado)


def concatenateTrials(categories):
    cats = json.loads(categories)
    resilt = " => ".join(cats)
    return resilt


keysv2 = list(ValuesExperiment.Categories.keys())
usersprolific[keysv2] = usersprolific['category_colour_association'].apply(categories_color_relationship)

usersprolific['order_trials_12'] = usersprolific['shortMonitoringTask'].apply(concatenateTrials)
usersprolific['order_trials_24'] = usersprolific['longMonitoringTask'].apply(concatenateTrials)
usersprolificexpanded = usersprolific.drop(
    ['session_id', 'category_colour_association', 'colours', 'longMonitoringTask', 'shortMonitoringTask', 'PENDING'],
    axis=1)
usersprolificexpanded.to_sql('users_prolific_expanded', con=engine, if_exists='append', index=False)
usersprolificexpanded.to_csv("../data/DSTL08demographics.csv", index=False);
'''END USERSPROLIFIC'''

'''SECTION FOR PARSING CATEGORY LEARNING
START'''

tableCategoryLearning = pd.read_sql_query('SELECT * FROM participant_category_learning ', engine)
pd.set_option("display.max_colwidth", None)

arrayColumns = ["type", "category_learning_trial", "condition_experiment", "tick", "completed_by", "participant_id",
                "starting_time_trial", "finishing_time_trial",
                "reaction_time", "category", "category_id", "category_selected", "category_selected_id", "correct"]

print("columns category learning: " + str(len(arrayColumns)))
rows_list = []

def parseCategoryLearning(replay):
    #  print(replay)
    categoryLearningTrials = json.loads(replay['replay'])

    # print(" trials category learning " + str(len(categoryLearningTrials)))
    # print(categoryLearningTrials)
    # print(len(categoryLearningTrials.keys()))
    for trial in categoryLearningTrials:
        info = categoryLearningTrials[trial][0]['complete_category_learning_trial']
        dict = {}
        dict['id_participant'] = replay['id'];
        for column in arrayColumns:
            if str(info[column]) == "completeTrial":
                # print("Sutituyendo complete trial")
                dict[column] = "complete_category_learning_trial";
            else:
                if info[column] == 'N/A':
                    dict[column] = 'NA';
                else:
                    dict[column] = info[column];

        dict['trained'] = replay['trained'];
        rows_list.append(dict)


#
tableCategoryLearning.apply(parseCategoryLearning, axis=1)
resultTrialsCategoryLearning = pd.DataFrame(rows_list)

pd.set_option("display.max_colwidth", None)
resultTrialsCategoryLearning.to_sql('category_learning_trials_expanded', con=engine, if_exists='append', index=False)

''' SECTION FOR PARSING CATEGORY LEARNING
END
'''

print("parsing category learning complete")

'''SECTION FOR PARSING PRACTICE TRIALS
START'''

tablePractice = pd.read_sql_query('SELECT * FROM participantpractice', engine)

arrayColumns2 = [
    "type",
    "practice_trial",  # complete_practice_trial
    "condition_experiment",
    "tick",
    "completed_by",
    "participant_id",
    "starting_time_trial",
    "finishing_time_trial",
    "reaction_time",
    "iti_trial",
    "previous_category_id",
    "previous_category",
    "selected_id",
    "current_position_entity_selected",
    "selected_entity_category_id",
    "selected_entity_category",
    "changed_entity_id",
    "changed_entity_category_id",
    "changed_entity_category",
    "current_position_entity_changed",
    "entities_by_category",
    "correct"
]

print("columns practice: " + str(len(arrayColumns2)))
rows_list_practice = []

def parsePractice(replay):
    practiceTrials = json.loads(replay['replay'])

    # print(" trials practice " + str(len(practiceTrials)))

    # print(" trials practice " + str(practiceTrials))
    for trial in practiceTrials:
        info = practiceTrials[trial][0]['complete_practice_trial']
        dict = {}
        dict['id_participant'] = replay['id'];
        for column in arrayColumns2:
            if str(column) == "current_position_entity_selected":
                pos = info[column]
                if pos == "N/A":
                    dict["current_position_entity_selected_x"] = "NA"
                    dict["current_position_entity_selected_y"] = "NA"
                else:

                    dict["current_position_entity_selected_x"] = pos['x']
                    dict["current_position_entity_selected_y"] = pos['y']
            elif str(column) == "current_position_entity_changed":
                pos = info[column]
                if pos == "N/A":
                    dict["current_position_entity_changed_x"] = "NA"
                    dict["current_position_entity_changed_y"] = "NA"
                else:

                    dict["current_position_entity_changed_x"] = pos['x']
                    dict["current_position_entity_changed_y"] = pos['y']
            elif str(column) == "entities_by_category":
                print("")
            else:
                if info[column] == 'N/A':
                    dict[column] = 'NA';
                else:
                    dict[column] = info[column];

        rows_list_practice.append(dict)


tablePractice.apply(parsePractice, axis=1)
resultTrialsPractice = pd.DataFrame(rows_list_practice)

pd.set_option("display.max_colwidth", None)
resultTrialsPractice.to_sql('practice_trials_expanded', con=engine, if_exists='append', index=False)

'''SECTION FOR PARSING PRACTICE TRIALS
END'''

print("parsing practice complete")

# START: Section for parsing monitoring trials first round
arrayColumnsPerformance = [
    "type",
    "monitoring_trial",
    "condition_experiment",
    "tick",
    "completed_by",
    "participant_id",
    "starting_time_trial",
    "finishing_time_trial",
    "trial_no_change",
    "trial_description",
    "reaction_time",
    "iti_trial",
    "previous_category_id",
    "previous_category",
    "current_position_entity_selected",
    "selected_entity_id",
    "selected_entity_category_id",
    "selected_entity_category",
    "changed_entity_id",
    "changed_entity_category_id",
    "changed_entity_category",
    "current_position_entity_changed",
    "entities_by_category",
    "correct"
]
print("columns monitoring " + str(len(arrayColumnsPerformance)))

tablePerformanceFirstRound = pd.read_sql_query('SELECT * FROM participantmonitoring', engine)

rows_list_performance1stRound = []

def parsePerformanceFirstRound(replay):
    performance1stRoundTrials = json.loads(replay['replay'])
    print(" trials monitoring second round " + str(len(performance1stRoundTrials)))
    for trial in performance1stRoundTrials:
        info = performance1stRoundTrials[trial][0]['complete_monitoring_trial']
        dict = {}
        dict['id_participant'] = replay['id'];
        dict['first_round'] = 0;
        dict['second_round'] = 1;
        for column in arrayColumnsPerformance:
            if str(column) == "current_position_entity_selected":

                pos = info[column]

                if pos == "N/A":
                    dict["current_position_entity_selected_x"] = "NA"
                    dict["current_position_entity_selected_y"] = "NA"
                else:
                    dict["current_position_entity_selected_x"] = pos['x']
                    dict["current_position_entity_selected_y"] = pos['y']
            elif str(column) == "current_position_entity_changed":

                pos = info[column]

                if pos == "N/A":
                    dict["current_position_entity_changed_x"] = "NA"
                    dict["current_position_entity_changed_y"] = "NA"
                else:

                    dict["current_position_entity_changed_x"] = pos['x']
                    dict["current_position_entity_changed_y"] = pos['y']
            elif str(column) == "trial_description":
                change = info[column]
                # print(change)
                # print(change[0])
                dict["from_category_id"] = change[0]
                dict["to_category_id"] = change[1]

            elif str(column) == "entities_by_category":

                pos = info[column]
                # {'UNKNOWN': 1, 'HOSTILE': 2, 'NEUTRAL': 1, 'PENDING': 0, 'FRIEND': 0, 'ASSUMED_FRIEND': 0,
                # 'ASSUMED_HOSTILE': 0, 'UNCERTAIN_FRIEND': 0, 'UNCERTAIN_HOSTILE': 0}
                totalEntities = 0
                dict["HOSTILE_entities"] = pos['HOSTILE']
                totalEntities = totalEntities + int(pos['HOSTILE'])
                dict["NEUTRAL_entities"] = pos['NEUTRAL']
                totalEntities = totalEntities + int(pos['NEUTRAL'])
                dict["PENDING_entities"] = pos['PENDING']
                totalEntities = totalEntities + int(pos['PENDING'])
                dict["UNKNOWN_entities"] = pos['UNKNOWN']
                totalEntities = totalEntities + int(pos['UNKNOWN'])
                dict["FRIEND_entities"] = pos['FRIEND']
                totalEntities = totalEntities + int(pos['FRIEND'])
                dict["ASSUMED_FRIEND_entities"] = pos['ASSUMED_FRIEND']
                totalEntities = totalEntities + int(pos['ASSUMED_FRIEND'])
                dict["ASSUMED_HOSTILE_entities"] = pos['ASSUMED_HOSTILE']
                totalEntities = totalEntities + int(pos['ASSUMED_HOSTILE'])
                dict["UNCERTAIN_FRIEND_entities"] = pos['UNCERTAIN_FRIEND']
                totalEntities = totalEntities + int(pos['UNCERTAIN_FRIEND'])
                dict["UNCERTAIN_HOSTILE_entities"] = pos['UNCERTAIN_HOSTILE']
                totalEntities = totalEntities + int(pos['UNCERTAIN_HOSTILE'])
                dict["total_entities_second_round"] = totalEntities
            else:

                if info[column] == 'N/A':
                    dict[column] = 'NA';
                else:
                    dict[column] = info[column];
        rows_list_performance1stRound.append(dict)


tablePerformanceFirstRound.apply(parsePerformanceFirstRound, axis=1)
resultTrialsPerformance1stRound = pd.DataFrame(rows_list_performance1stRound)

resultTrialsPerformance1stRound.to_sql('monitoring_1st_round_trials_expanded', con=engine, if_exists='append',
                                       index=False)
# END: Section for parsing monitoring trials first round

'''SECTION FOR PARSING MONITORING TRIALS second round
START'''

# tablePerformanceFirstRound = pd.read_sql_query('SELECT * FROM participantmonitoring', engine)
arrayColumnsPerformance = [
    "type",
    "monitoring_trial",
    "condition_experiment",
    "tick",
    "completed_by",
    "participant_id",
    "starting_time_trial",
    "finishing_time_trial",
    "trial_no_change",
    "trial_description",
    "reaction_time",
    "iti_trial",
    "previous_category_id",
    "previous_category",
    "current_position_entity_selected",
    "selected_entity_id",
    "selected_entity_category_id",
    "selected_entity_category",
    "changed_entity_id",
    "changed_entity_category_id",
    "changed_entity_category",
    "current_position_entity_changed",
    "entities_by_category",
    "correct"
]
print("columns monitoring " + str(len(arrayColumnsPerformance)))

tablePerformanceSecondRound = pd.read_sql_query('SELECT * FROM participantmonitoring_secondround', engine)
rows_list_performance2ndRound = []

def parsePerformanceSecondRound(replay):
    performance2ndRoundTrials = json.loads(replay['replay'])
    print(" trials monitoring second round " + str(len(performance2ndRoundTrials)))
    for trial in performance2ndRoundTrials:
        info = performance2ndRoundTrials[trial][0]['complete_monitoring_trial']
        dict = {}
        dict['id_participant'] = replay['id'];
        dict['first_round'] = 0;
        dict['second_round'] = 1;
        for column in arrayColumnsPerformance:
            if str(column) == "current_position_entity_selected":

                pos = info[column]

                if pos == "N/A":
                    dict["current_position_entity_selected_x"] = "NA"
                    dict["current_position_entity_selected_y"] = "NA"
                else:

                    dict["current_position_entity_selected_x"] = pos['x']
                    dict["current_position_entity_selected_y"] = pos['y']
            elif str(column) == "current_position_entity_changed":

                pos = info[column]

                if pos == "N/A":
                    dict["current_position_entity_changed_x"] = "NA"
                    dict["current_position_entity_changed_y"] = "NA"
                else:

                    dict["current_position_entity_changed_x"] = pos['x']
                    dict["current_position_entity_changed_y"] = pos['y']
            elif str(column) == "trial_description":
                change = info[column]
                # print(change)
                # print(change[0])
                dict["from_category_id"] = change[0]
                dict["to_category_id"] = change[1]

            elif str(column) == "entities_by_category":

                pos = info[column]
                # {'UNKNOWN': 1, 'HOSTILE': 2, 'NEUTRAL': 1, 'PENDING': 0, 'FRIEND': 0, 'ASSUMED_FRIEND': 0,
                # 'ASSUMED_HOSTILE': 0, 'UNCERTAIN_FRIEND': 0, 'UNCERTAIN_HOSTILE': 0}
                totalEntities = 0
                dict["HOSTILE_entities"] = pos['HOSTILE']
                totalEntities = totalEntities + int(pos['HOSTILE'])
                dict["NEUTRAL_entities"] = pos['NEUTRAL']
                totalEntities = totalEntities + int(pos['NEUTRAL'])
                dict["PENDING_entities"] = pos['PENDING']
                totalEntities = totalEntities + int(pos['PENDING'])
                dict["UNKNOWN_entities"] = pos['UNKNOWN']
                totalEntities = totalEntities + int(pos['UNKNOWN'])
                dict["FRIEND_entities"] = pos['FRIEND']
                totalEntities = totalEntities + int(pos['FRIEND'])
                dict["ASSUMED_FRIEND_entities"] = pos['ASSUMED_FRIEND']
                totalEntities = totalEntities + int(pos['ASSUMED_FRIEND'])
                dict["ASSUMED_HOSTILE_entities"] = pos['ASSUMED_HOSTILE']
                totalEntities = totalEntities + int(pos['ASSUMED_HOSTILE'])
                dict["UNCERTAIN_FRIEND_entities"] = pos['UNCERTAIN_FRIEND']
                totalEntities = totalEntities + int(pos['UNCERTAIN_FRIEND'])
                dict["UNCERTAIN_HOSTILE_entities"] = pos['UNCERTAIN_HOSTILE']
                totalEntities = totalEntities + int(pos['UNCERTAIN_HOSTILE'])
                dict["total_entities_second_round"] = totalEntities
            else:

                if info[column] == 'N/A':
                    dict[column] = 'NA';
                else:
                    dict[column] = info[column];
        rows_list_performance2ndRound.append(dict)


tablePerformanceSecondRound.apply(parsePerformanceSecondRound, axis=1)
resultTrialsPerformance2ndRound = pd.DataFrame(rows_list_performance2ndRound)

resultTrialsPerformance2ndRound.to_sql('monitoring_2nd_round_trials_expanded', con=engine, if_exists='append',
                                       index=False)

print("parsing monitoring second round complete")

# START: Parse third round
tablePerformanceThirdRound = pd.read_sql_query('SELECT * FROM participantmonitoring_thirdround', engine)

rows_list_performance3rdRound = []

def parsePerformanceThirdRound(replay):
    performance3rdRoundTrials = json.loads(replay['replay'])
    print(" trials monitoring second round " + str(len(performance3rdRoundTrials)))
    for trial in performance3rdRoundTrials:
        info = performance3rdRoundTrials[trial][0]['complete_monitoring_trial']
        dict = {}
        dict['id_participant'] = replay['id'];
        dict['first_round'] = 0;
        dict['second_round'] = 1;
        for column in arrayColumnsPerformance:
            if str(column) == "current_position_entity_selected":

                pos = info[column]

                if pos == "N/A":
                    dict["current_position_entity_selected_x"] = "NA"
                    dict["current_position_entity_selected_y"] = "NA"
                else:
                    dict["current_position_entity_selected_x"] = pos['x']
                    dict["current_position_entity_selected_y"] = pos['y']
            elif str(column) == "current_position_entity_changed":

                pos = info[column]

                if pos == "N/A":
                    dict["current_position_entity_changed_x"] = "NA"
                    dict["current_position_entity_changed_y"] = "NA"
                else:

                    dict["current_position_entity_changed_x"] = pos['x']
                    dict["current_position_entity_changed_y"] = pos['y']
            elif str(column) == "trial_description":
                change = info[column]
                # print(change)
                # print(change[0])
                dict["from_category_id"] = change[0]
                dict["to_category_id"] = change[1]

            elif str(column) == "entities_by_category":

                pos = info[column]
                # {'UNKNOWN': 1, 'HOSTILE': 2, 'NEUTRAL': 1, 'PENDING': 0, 'FRIEND': 0, 'ASSUMED_FRIEND': 0,
                # 'ASSUMED_HOSTILE': 0, 'UNCERTAIN_FRIEND': 0, 'UNCERTAIN_HOSTILE': 0}
                totalEntities = 0
                dict["HOSTILE_entities"] = pos['HOSTILE']
                totalEntities = totalEntities + int(pos['HOSTILE'])
                dict["NEUTRAL_entities"] = pos['NEUTRAL']
                totalEntities = totalEntities + int(pos['NEUTRAL'])
                dict["PENDING_entities"] = pos['PENDING']
                totalEntities = totalEntities + int(pos['PENDING'])
                dict["UNKNOWN_entities"] = pos['UNKNOWN']
                totalEntities = totalEntities + int(pos['UNKNOWN'])
                dict["FRIEND_entities"] = pos['FRIEND']
                totalEntities = totalEntities + int(pos['FRIEND'])
                dict["ASSUMED_FRIEND_entities"] = pos['ASSUMED_FRIEND']
                totalEntities = totalEntities + int(pos['ASSUMED_FRIEND'])
                dict["ASSUMED_HOSTILE_entities"] = pos['ASSUMED_HOSTILE']
                totalEntities = totalEntities + int(pos['ASSUMED_HOSTILE'])
                dict["UNCERTAIN_FRIEND_entities"] = pos['UNCERTAIN_FRIEND']
                totalEntities = totalEntities + int(pos['UNCERTAIN_FRIEND'])
                dict["UNCERTAIN_HOSTILE_entities"] = pos['UNCERTAIN_HOSTILE']
                totalEntities = totalEntities + int(pos['UNCERTAIN_HOSTILE'])
                dict["total_entities_second_round"] = totalEntities
            else:

                if info[column] == 'N/A':
                    dict[column] = 'NA';
                else:
                    dict[column] = info[column];
        rows_list_performance3rdRound.append(dict)


tablePerformanceThirdRound.apply(parsePerformanceThirdRound, axis=1)
resultTrialsPerformance3rdRound = pd.DataFrame(rows_list_performance3rdRound)

resultTrialsPerformance3rdRound.to_sql('monitoring_3rd_round_trials_expanded', con=engine, if_exists='append',
                                       index=False)
# END: Section for parsing monitoring trials first round


resultTrialsPerformance1stRound['round'] = 1
resultTrialsPerformance2ndRound['round'] = 2
resultTrialsPerformance3rdRound['round'] = 3

trials = [resultTrialsCategoryLearning, resultTrialsPractice, resultTrialsPerformance1stRound,
          resultTrialsPerformance2ndRound, resultTrialsPerformance3rdRound];

total = pd.concat(trials);

total.to_sql('experiment3', con=engine, if_exists='append', index=False)

total.to_csv("../data/DSTL08rawData.csv", index=False);


# tableTrials = pd.read_sql_query('SELECT * FROM participant_category_learning as categorylearning, usersprolific, prolificdata, participantpractice as practice, participantmonitoring_secondround as monitoring1, participantmonitoring as monitoring2, experiment as expanded where usersprolific.prolific_id = prolificdata.participant_id and usersprolific.id_participant = categorylearning.id and usersprolific.id_participant = practice.id and usersprolific.id_participant = monitoring1.id and usersprolific.id_participant = monitoring2.id and prolificdata.status = "APPROVED"', engine)
# tableTrials.to_csv("CompleteTrials.csv", index=False);
