# Analysis of DSTL08 experiment
# C. E. R. Edmunds, Queen Mary, University of London. 
# 3-12-2020

# Setup --------------------------------------------------------------------------------------------
rm(list=ls())

require(data.table); require(ggplot2); require(viridis); require(emmeans); require(BayesFactor); 
require(car); library(plyr)

data <- fread('../data/DSTL08longData.csv')

# Category learning phase: Graphs ------------------------------------------------------------------
clData <- data[experiment_phase=="categoryLearning", 1:14] # Get category learning data

# Getting summary statistics of category learning
clSummary <- clData[, list(trialsToCriterion=which.max(trial),
                           meanAccuracy=mean(correct, na.rm=T),
                           meanRT=mean(reaction_time, na.rm=T),
                           sdRT=sd(reaction_time, na.rm=T),
                           nTimeouts=sum(completed_by=="TIMEOUT", na.rm=F)), 
                    by=.(id_participant, condition, uncertaintyCondition, backgroundCondition)]

# Reorder factor for graphs
clSummary$uncertaintyCondition <- factor(clSummary$uncertaintyCondition, levels=c("control", "categorical", "uncertainty"))
clSummary$backgroundCondition <- factor(clSummary$backgroundCondition)

# Investigating the proportion of timeouts
clSummary[, propTimeouts:= nTimeouts/trialsToCriterion]

# Histograms of number of timeouts
ggplot(clSummary, aes(x=propTimeouts, fill=uncertaintyCondition)) +
  geom_histogram(binwidth=0.01, position="identity") +
  facet_grid(backgroundCondition~uncertaintyCondition) +
  labs(x="Proportion of timeouts", y="Count") +
  scale_fill_viridis(discrete=T) +
  theme_bw() 
ggsave("../techReport/images/DSTL08CLhistogramTimeouts.pdf", units="in", width=6, height=3)

# Exploring trials to criterion
# Histograms of trials to criterion
ggplot(clSummary, aes(x=trialsToCriterion, fill=uncertaintyCondition)) +
  geom_histogram(binwidth=1, position="identity") +
  facet_grid(backgroundCondition~uncertaintyCondition) +
  labs(x="Trials to criterion", y="Count") +
  scale_fill_viridis(discrete=T) +
  theme_bw()
# ggsave("../techReport/images/DSTL03CLhistogramTrialsCriterion.pdf", units="in", width=6, height=3)

clSummary$condition <- factor(clSummary$condition, 
                              levels=c("control_black", "control_radar", 
                                       "categorical_black", "categorical_radar",
                                       "uncertainty_black", "uncertainty_radar"))

# Boxplot of trials to criterion
ggplot(clSummary, aes(x=condition, y=trialsToCriterion, fill=uncertaintyCondition, 
                      alpha=as.factor(backgroundCondition))) +
  stat_boxplot(geom ='errorbar', width=0.1) + 
  geom_boxplot(show.legend = FALSE, width=0.8) +
  scale_alpha_discrete(range = c(0.4, 0.95), guide=FALSE) +
  labs(x = "Condition", y="Trials to criterion") +
  scale_fill_viridis(discrete=T) +
  theme_bw()
ggsave("../techReport/images/DSTL08CLboxplotTrialsCriterion.pdf", units="in", width=7, height=3.5)

# Category learning phase: Tests -------------------------------------------------------------------
# Is length of time to criterion affected by condition?
cl.criterion.aov <- aov(trialsToCriterion ~ uncertaintyCondition*backgroundCondition, data=clSummary)
summary(cl.criterion.aov)

# Checking ANOVA assumptions
# Checking homogeneity of variance
plot(cl.criterion.aov, 1)

# Levene's test for homogeneity of variance
leveneTest(trialsToCriterion ~ uncertaintyCondition*backgroundCondition, data=clSummary)

# Check normality
plot(cl.criterion.aov, 2)

# Extract the residuals
aov_residuals <- residuals(object = cl.criterion.aov )

# Run Shapiro-Wilk test
shapiro.test(x = aov_residuals )

# Transform trials to criterion
clSummary[,trTrialsToCriterion:=trialsToCriterion^2]

# Re-do anova
cl.criterion.aov <- aov(trTrialsToCriterion ~ uncertaintyCondition*backgroundCondition, data=clSummary)
summary(cl.criterion.aov)

emmeans(cl.criterion.aov, ~ backgroundCondition)

means.cl.criterion <- emmeans(cl.criterion.aov, ~ uncertaintyCondition*backgroundCondition)
means.cl.criterion

cl.criterion.bf <-  anovaBF(trialsToCriterion ~ uncertaintyCondition*backgroundCondition, data=clSummary)
cl.criterion.bf
cl.criterion.bf[4]/cl.criterion.bf[3]

# Multiple pairwise comparisons
TukeyHSD(cl.criterion.aov)

# Category learning: RTs ---------------------------------------------------------------------------
# Histogram of reaction times 
ggplot(clSummary, aes(x=meanRT, fill=condition)) +
  geom_histogram(binwidth=200, position="identity", alpha=0.5) +
  labs(x="Reaction times", y="Count") +
  scale_fill_viridis(discrete=T) +
  theme_bw()

# Boxplot of reaction times 
ggplot(clSummary, aes(x=condition, y=meanRT, fill=uncertaintyCondition, 
                      alpha=as.factor(backgroundCondition))) +
  stat_boxplot(geom ='errorbar', width=0.1) + 
  geom_boxplot(show.legend = FALSE, width=0.8) +
  scale_alpha_discrete(range = c(0.4, 0.95), guide=FALSE) +
  labs(x = "Condition", y="Mean reaction time (ms)") +
  scale_fill_viridis(discrete=T) +
  theme_bw()
ggsave("../techReport/images/DSTL08CLboxplotRT.pdf", units="in", width=7, height=3.5)

# Is reaction time affected by condition?
cl.rt.aov <- aov(meanRT ~ uncertaintyCondition*backgroundCondition, data=clSummary)
summary(cl.rt.aov)

# Checking anova assumptions
# Checking homogeneity of variance
plot(cl.rt.aov, 1)

# Levene's test for homogeneity of variance
leveneTest(meanRT ~ uncertaintyCondition*backgroundCondition, data=clSummary)

# Check normality
plot(cl.rt.aov, 2)

# Extract the residuals
aov_residuals <- residuals(object = cl.rt.aov )

# Run Shapiro-Wilk test
shapiro.test(x = aov_residuals )

# Multiple pairwise comparisons
TukeyHSD(cl.rt.aov)

# Get means
emmeans(cl.rt.aov, ~ uncertaintyCondition)

means.cl.rt <- emmeans(cl.rt.aov, ~ condition)
means.cl.rt

cl.rt.bf <-  anovaBF(meanRT ~ uncertaintyCondition*backgroundCondition, data=clSummary)
cl.rt.bf
cl.rt.bf[4]/cl.rt.bf[3]

# Monitoring ---------------------------------------------------------------------------------------
mData <- data[experiment_phase=="monitoring", 
              !c("category", "category_id", "category_selected", "category_selected_id")]

# Sort out correct column (not removing timeouts)
mData[, correct:= 0]
mData[completed_by=="CLICKED", correct:= ifelse(changed_entity_id==selected_entity_id, 1, 0)]
mData[no_change==1, correct:= ifelse(completed_by=="CLICKED", 0, 1)]

# Monitoring: accuracy -----------------------------------------------------------------------------

# Get summary data
mSummary <- mData[, list(meanAccuracy=mean(correct, na.rm=T),
                         nTimeouts=sum(is.na(reaction_time))), 
                  by=.(id_participant, condition, uncertaintyCondition, backgroundCondition)]
mSummary$condition <- factor(mSummary$condition, 
                             levels=c("control_black", "control_radar", 
                                      "categorical_black", "categorical_radar",
                                      "uncertainty_black", "uncertainty_radar"))
mSummary$uncertaintyCondition <- factor(mSummary$uncertaintyCondition)
mSummary$backgroundCondition <- factor(mSummary$backgroundCondition)

# Boxplots of number of timeouts
ggplot(mSummary, aes(x=condition, y=nTimeouts, fill=uncertaintyCondition, 
                     alpha=as.factor(backgroundCondition))) +
  stat_boxplot(geom ='errorbar', width=0.1) + 
  geom_boxplot(show.legend = FALSE, width=0.8) +
  scale_alpha_discrete(range = c(0.4, 0.95), guide=FALSE) +
  labs(x = "Condition", y="Number of timeouts") +
  scale_fill_viridis(discrete=T) +
  theme_bw()
ggsave("../techReport/images/DSTL08MboxplotTimeouts.pdf", units="in", width=7, height=3.5)

# Monitoring: Accuracy -----------------------------------------------------------------------------
# Boxplots of accuracy: untransformed
ggplot(mSummary, aes(x=condition, y=meanAccuracy, fill=uncertaintyCondition, 
                     alpha=as.factor(backgroundCondition))) +
  stat_boxplot(geom ='errorbar', width=0.1) + 
  geom_boxplot(show.legend = FALSE, width=0.8) +
  scale_alpha_discrete(range = c(0.4, 0.95), guide=FALSE) +
  labs(x = "Condition", y="Accuracy") +
  scale_fill_viridis(discrete=T) +
  theme_bw()
ggsave("../techReport/images/DSTL08MboxplotAccuracy.pdf", units="in", width=7, height=3.5)

# Removing outliers
outliers <- boxplot(meanAccuracy ~ condition, data=mSummary)$out
mSummary <- mSummary[!(meanAccuracy>0.66 & condition=="control_radar"),]
mSummary$id_participant <- factor(mSummary$id_participant)

# Is accuracy affected by condition?
m.acc.aov <- aov(meanAccuracy ~ uncertaintyCondition*backgroundCondition, 
                 data=mSummary)
summary(m.acc.aov)

emmeans(m.acc.aov, specs = pairwise ~ uncertaintyCondition)
emmeans(m.acc.aov, specs = pairwise ~ backgroundCondition)

m.acc.bf <-  anovaBF(meanAccuracy ~ uncertaintyCondition*backgroundCondition, 
                     data=mSummary, whichModels="bottom")
m.acc.bf

# Monitoring: Reaction times -----------------------------------------------------------------------
# Get summary data
mSummary <- mData[, list(meanRT=mean(reaction_time, na.rm=T),
                         nTimeouts=sum(is.na(reaction_time))), 
                  by=.(id_participant, condition, uncertaintyCondition, backgroundCondition)]
mSummary$condition <- factor(mSummary$condition, 
                             levels=c("control_black", "control_radar", 
                                      "categorical_black", "categorical_radar",
                                      "uncertainty_black", "uncertainty_radar"))
mSummary$uncertaintyCondition <- factor(mSummary$uncertaintyCondition)
mSummary$backgroundCondition <- factor(mSummary$backgroundCondition)

ggplot(mSummary, aes(x=condition, y=meanRT, fill=uncertaintyCondition, 
                     alpha=as.factor(backgroundCondition))) +
  stat_boxplot(geom ='errorbar', width=0.1) + 
  geom_boxplot(show.legend = FALSE, width=0.8) +
  scale_alpha_discrete(range = c(0.4, 0.95), guide=FALSE) +
  labs(x = "Condition", y="Reaction time") +
  scale_fill_viridis(discrete=T) +
  theme_bw()
ggsave("../techReport/images/DSTL08MboxplotRT.pdf", units="in", width=7, height=3.5)

# Removing outliers
outliers <- boxplot(meanRT ~ condition, data=mSummary)$out
mSummary <- mSummary[-which(meanRT %in% outliers),]
mSummary$id_participant <- factor(mSummary$id_participant)

# Monitoring: reaction time: ANOVA -----------------------------------------------------------------
# Is reaction time affected by condition?
m.rt.aov <- aov(meanRT ~ uncertaintyCondition*backgroundCondition, 
                data=mSummary)
summary(m.rt.aov)

emmeans(m.rt.aov, specs = pairwise ~ uncertaintyCondition)

m.rt.bf <-  anovaBF(meanRT ~ uncertaintyCondition*backgroundCondition, 
                    data=mSummary, whichRandom="id_participant", whichModels="bottom")
m.rt.bf
