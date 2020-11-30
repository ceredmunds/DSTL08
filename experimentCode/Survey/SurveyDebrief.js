var json = {
    title: "Uncertainty in Entities",
    showProgressBar: "top",
    pages:
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
                            name: "Failed",
                            html:
                                " <h4> Ooops</h4>" +
                               "Unfortunately, you failed to pass the status training. <br/> Thank you very much for your participation.                               <br>" +


                                    "<h4> Debriefing</h4>" +
                                "Thanks for completing the experiment! .<br>" +
                                        "This experiment aims to examine how best to represent uncertainty in decision-making this information (you only saw one of them!).<br>" +
                                        "In the first way, there is no uncertainty information. In the second way, there is uncertainty information and it is represented as a different colour.<br>" +
                                        "For instance, “friendly” and “assumed friendly” are represented by two different colours. In the third way, there is uncertainty information and it is represented as the depth of shading.<br>" +
                                        "the same colour, but one is filled, and one is only shaded. We hope to see that including <br>" +
                                        "uncertainty information improves performance on the monitoring task. By comparing our participants' speed and accuracy, we hope<br>" +
                                        "to identify which of the ways of presenting uncertainty is better."


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
       // Game.finish();
    });
});

survey.render("surveyElement");
