# Preprocessing of DSTL08 experiment data
# C. E. R. Edmunds, Queen Mary, University of London. 
# 3-12-2020

# Setup --------------------------------------------------------------------------------------------
rm(list=ls())

require(data.table); require(plyr); require(stringr)

data <- fread('../data/DSTL08rawData.csv')
pptData <- fread('../data/DSTL08demographics.csv')

data <- data[id_participant %in% unique(pptData$id_participant),]

# Summary table
table(pptData$condition_exp)

# Exclusions: 2 x Technical issues "5e3df34cfb9ed506f1028bb5"
remove <- pptData[prolific_id=="5b7ffeeb05fbbd00016aa0bc", id_participant]
pptData <- pptData[!id_participant %in% remove,]
data <- data[!id_participant %in% remove,]

# Tidying data -------------------------------------------------------------------------------------
# Set column names
setnames(data, c("type", "condition_experiment", "category_learning_trial", "trial_no_change"), 
         c("experiment_phase", "condition", "trial", "no_change"))

# Column: condition
data[, condition:= factor(condition, 
                          labels = c("control_black", "categorical_black", "uncertainty_black", 
                                     "control_radar", "categorical_radar", "uncertainty_radar"))]
data[, uncertaintyCondition:= vapply(str_split(data$condition,"_"), `[`, 1, FUN.VALUE=character(1))]
data[, backgroundCondition:= vapply(str_split(data$condition,"_"), `[`, 2, FUN.VALUE=character(1))]

# Column 2
data$experiment_phase <- revalue(data$experiment_phase, 
                                 c(complete_category_learning_trial="categoryLearning",
                                   complete_practice_trial="practiceMonitoring",
                                   complete_monitoring_trial="monitoring"))

# Column 3
data[experiment_phase=="practiceMonitoring", trial:= practice_trial + 1]
data[experiment_phase=="monitoring", trial:= monitoring_trial + 1]
data[, c("practice_trial", "monitoring_trial"):= NULL]

# Column 4/6
data[, c("tick", "participant_id"):= NULL]

# Columns 7-9
data[, c("starting_time_trial", "finishing_time_trial"):= NULL]

# Column: "correct"
data[, correct:= as.integer(correct)]

# Column: completed_by
data[, completed_by:= vapply(str_split(data$completed_by,"_"), `[`, 1, FUN.VALUE=character(1))]

# Reorder
setcolorder(data, c("id_participant", "condition", "uncertaintyCondition", "backgroundCondition", 
                    "experiment_phase", "round", "trial", "correct", 
                    "completed_by", "reaction_time", "category", "category_selected", 
                    "category_id", "category_selected_id"))

data <- data[order(id_participant),]

fwrite(data, "../data/DSTL08longData.csv")
