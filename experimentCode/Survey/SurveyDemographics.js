
TrialsRatio.init()

// Code below for generating trials
// TrialsRatio.initCreateMode()
// console.log(TrialsRatio.proposedTrials.length)
// console.log("trial")
// TrialsRatio.getTrialPath()
// console.log("test")

Game.getCategoriesByCondition();
entitiesUILabel = Game.categoriesByCondition.map(x => " " + Category.getUILabel(x));
intro = WebPages.condition2Intro

// console.log("Condition "+ Game.conditionExperiment);
var json = {
    title: "Uncertainty in Entities",
    showProgressBar: "top",
    pages:
        [
            //start
/*
            {
                 title: "Consent Form",
                 questions:
                     [
                         {
                             type: "html",
                             name: "Information sheet",
                             html: "<div id='consentForm' align='left'><img src='img/qmul/qmulHeader.png' class='centerQMUL' /><br/><h1 align='center'> Research study “Communicating Uncertainty” information for participants</h1>"
                                 + "<div id='introText' text-align='justify'> <br/>We would like to invite you to be part of this research project, if you would like to.  You should only agree to take part if you want to, it is entirely up to you.<br/>" +
                                 "If you choose not to take part there won’t be any disadvantages for you and you will hear no more about it.<br/>" +
 "<h2> Description </h2>"
                                 +
                                 "This experiment aims to examine how best to represent uncertainty in decision-making " +
                                 "tasks that are presented visually. <br/><br/>"
                                 +"The study will be divided into three phases: you will be presented with a training task, then you will be practicing a monitoring task for a few trials.<br> Once that you have familiarised yourself with the task, you will be performing the monitoring task.<br/>" +
                                 "At the end of the study you will be presented with a brief summary of the aims of the study, and if you want further details the contact details of the lead researcher included.  "
                                 + "<br/>The whole study should take no more than between <b>20 minutes</b> in total.  "
                                 + "<br/><br/><br/>This study has been approved by Queen Mary University of London Research Ethics Committee <b>QMREC1761.</b><br>"
                                 + "All information given in the study will be completely confidential and anonymous, in accordance to the Data Protection Act 1998.<br> To ensure full anonymity, you will not be asked your name. You have the right to request your data be destroyed after the completion of the study. "
                                 + "<br/>If you have any queries about the study or any concerns regarding the ethical conduct of this study, <b>please email    c.edmunds at qmul.ac.uk </b>."
                                 + "<br/>If you have any questions or concerns about the manner in which the study was conducted please, in the first instance, contact the researcher responsible for the study. <br/> If this is unsuccessful, or not appropriate, please contact the Secretary at the Queen Mary Ethics of Research Committee, Room W104, Queen’s Building, Mile End Campus, Mile End Road, London or research-ethics@qmul.ac.uk"
                                 + "</div></div>"
                         }, {
                             "type": "boolean",
                             "name": "bool",
                             "title": "Do you want to take part?",
                             "label": "Are you 18 or older?",
                             "isRequired": true
                         }
                     ]
             }
             ,
               //end
*/
            {
                title: "",
                questions: [
                    {
                        "type": "panel",
                        "innerIndent": 1,
                        "name": "panel1",
                        "title": "Task Description",

                        "elements": [

                            {

                                type: "html",
                                name: "Description",
                                html:
                                    " <h4>Introduction</h4>" +
                                    "In this experiment, we ask you to imagine you are in a junior position " +
                                    "(Seaman) within the Royal Navy.<br>" +
                                    " You will be monitoring an area of ocean in which there are several craft," +
                                    " each with a different status: <b>" + entitiesUILabel + "</b>.<br>" +
                                    " Your job will be to alert your superior officer when" +
                                    " a craft in your monitoring area changes status.<br>"

                                    +
                                    "<h4>Training</h4>" +
                                    "First, before the monitoring task, you will be given training on what each status looks like.<br>" +
                                    intro +
                                    " On each trial, select the status you think is associated with the symbol. <br>" +
                                    " After you make your response, you will receive feedback telling you the correct answer.<br>"
                                    +
                                    "You will need to get several correct answers in a row to progress to the next task.<br>" +
                                    "As per the Prolific advert, note that you will <b>not</b> be paid if you fail to adequately learn this task.<br><br>" +
                                   " <b>Do not to switch between browser tabs or your participation could be voided.</b>" +
                                    "<br/> <br/><b>Screen resolutions over 1440 x 900 are recommended.</b>"


                            }
                        ]
                    }


                ]
            }
        ]
};

//console.log(" experiment 3 , condition " + Game.conditionExperiment);
Survey
    .StylesManager
    .applyTheme("winterstone");
var survey = new Survey.Model(json);

survey.onComplete.add(function (result) {
    $('.sv_body.sv_completed_page').hide();
    $("body").css("overflow-y", "hidden");
    $(function () {
        Game.init();
        Game.surveyData = JSON.stringify(result.data);
//         console.log("enviando " + JSON.stringify(result.data ) );
    });
});

survey.render("surveyElement");
