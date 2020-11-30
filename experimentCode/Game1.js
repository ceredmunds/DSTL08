saveReplayIntoDB: function (trained) {
  console.log('%c Starting saveReplayIntoDB ! ', 'background: #222222; color: #33dddd');
  $('.levelSelectionBg').hide();
  if (Game.inTraining) {
    Game.inTraining = false;
    //            console.log("Antes de agregarle resultados al REPLAY")
    console.log('%c SaveReplayIntoDB  mode tutorial! ', 'background: #222222; color: #33ffda');
    $.ajax({
      type: "POST",
      url: 'php/insertParticipantCategoryLearning.php',
      data: {
        participantId: Game.idParticipant,
        trials: JSON.stringify(Game.trialTrainingResult),
        replay: JSON.stringify(Game.replay),
        survey: Game.surveyData,
        trained: trained ? 1 : 0,
      },
      success: function (data) {
        if (trained) {
          //                            console.log("SE SUPONE QUE YA GUARDO CON EXITO")
          //      $('#textoBye').innerHTML = 'This experiment aims to examine how best to represent uncertainty in decision-making                     tasks that are presented visually. We are comparing three different ways of presenting the depth of shading. For instance, “friendly” and “assumed friendly” are represented by                    the same colour, but one is filled, and one is only shaded. We hope to see that including uncertainty information improves performance on the monitoring task. Further, we hope                      to identify which of the ways of presenting uncertainty is better.                         :<br/><br/><br/>d.o.verdugapalencia@qmul.ac.uk<br/><button type="button" onclick="Game.finish()">	Click here to complete your participation!</button><br/>';
          Game.layerSwitchTo("GameStart");
          /**Hack technical debt *
          */
          var json = {
            title: "Uncertain entities",
            showProgressBar: "top",
            pages:

            [

              {
                title: "Training Finished",
                questions:
                [
                  {

                    type: "html",
                    name: "finishTutorial",
                    html: WebPages.trainingComplete
                  }
                ]
              }


            ]
          };

          var survey = new Survey.Model(json);

          survey.onComplete.add(function (result) {

            console.log('%c Starting Practice session! ', 'background: #aaaacc; color: 99ffdd');
            $('.sv_body.sv_completed_page').hide();
            //reseting values for second round
            $(function () {
              Game.teams = {};
              Game.mainTick = 0;
              Game.commands = {};
              Game.idPreviousEntity = -1;

              Game.inPractice = true;
              Game.replay = {};
              Game.firstTrial = true;
              Game.selectedUnit = {};
              Game.trialByClick = true;
              Participation.cmds = []
              clearInterval(Game.refreshIntervalId);
              console.log('%c Init values for Practice session! ', 'background: #aaaacc; color: 99ffdd');

              //deleting every unit
              Unit.allUnits.splice(0, Unit.allUnits.length);
              Unit.currentID = 0;
              //

              Game.play();

            });
          });

          survey.render("surveyElement");
        } else {
          console.log("Saved Untrained");
          //                        console.log('%c DEBO ESTAR EN BATEAR PARTICIPANT sion! ', 'background: #aaaacc; color: 99ffdd');
          Game.layerSwitchTo("GameStart");


          var json = {
            title: "Uncertain entities",
            showProgressBar: "top",
            pages:

            [

              {
                title: "Training Finished ",
                questions:
                [
                  {

                    type: "html",
                    name: "finishTutorial",

                    html: WebPages.htmlByeUntrained
                  }
                ]
              }

            ]
          };


          var survey = new Survey.Model(json);

          survey.onComplete.add(function (result) {

            console.log('%c Wrong sion! ', 'background: #aaaacc; color: 99ffdd');
            $('.sv_body.sv_completed_page').hide();
            //reseting values for second round
            $(function () {

              alert("Going back to prolific")
              window.location.href = 'https://app.prolific.ac/submissions/complete?cc=12341234';//HOOKIgual para descartar participantes


            });
          });

          survey.render("surveyElement");


        }
      }

      , error: function (xhr, ajaxOptions, thrownError) {


        console.log(" %c Error in SaveReplayIntoDB function " + xhr.status + "  Thrown Error " + thrownError, 'background: #aaaacc; color: ff0000')
        alert(xhr.status);
        alert(thrownError);
      }
    });

  } else if (Game.inPractice) {
    Game.layerSwitchTo("GameStart");
    Game.inPractice = false;
    console.log("Finishing In PRACTICE session")
    $.ajax({
      type: "POST",
      url: 'php/insertParticipantPractice.php',
      data: {
        participantId: Game.idParticipant,
        trials: JSON.stringify(Game.trialPracticeResult),
        replay: JSON.stringify(Game.replay)
      },

      success: function (data) {
        Game.layerSwitchTo("GameStart");
        console.log('%c Starting Performance session! SUCCESS', 'background: #aaaacc; color: 99ffdd');
        //                    console.log("Saved " + data);
        // Game.isPerformanceRoundOne = Game.idParticipant % 2 == 0;
        console.log(" PERFOMANCE  case with 12 entities? ", Game.isPerformanceRoundOne);
        console.log('%c  BEFORE MONITORING TASK ! ', 'background: #aaaacc; color: 99ffdd');


        var json = {
          title: "Communicating Uncertainties",
          showProgressBar: "top",
          pages:

          [

            {
              title: "Practice Monitoring Task Finished",
              questions:
              [
                {


                  type: "html",
                  name: "Summary",
                  html: '<h1> Monitoring Task</h1>' +
                  'Now, for the main monitoring task.<br/>' +
                  'This task will be broken into three parts, so you can have breaks.' +
                  '<br/><br/> Remember, you need to click on a craft when you\n' +
                  'notice that it changes status (changes colour).<br/><br/> <br/><b>Do not to switch between browser tabs or your participation could be voided.</b>',

                }
              ]
            }


          ]
        };


        Survey
          .StylesManager
          .applyTheme("winterstone");
        var survey = new Survey.Model(json);

        survey.onComplete.add(function (result) {
          console.log("OnCompleteSegundo survey");
          $('.sv_body.sv_completed_page').hide();
          $(function () {
            Game.teams = {};
            Game.firstTrial = true;
            Game.mainTick = 0;
            Game.commands = {};
            Game.inPerformance = true;
            Game.replay = {};
            Participation.cmds = [];
            Game.selectedUnit = {};

            Game.trialByClick = true;//check
            Game.idPreviousEntity = -1;
            clearInterval(Game.refreshIntervalId);
            Game.performanceFirstRound = true;
            console.log("***********************")

            if (Game.inPerformance) {
              console.log('%c Performance sessionTRUE ', 'background: #77ffcc; color: 99ffdd');
            }
            console.log('%c Init values for Performance session! ', 'background: #aaaacc; color: 99ffdd');


            //deleting every unit
            Unit.allUnits.splice(0, Unit.allUnits.length);
            Unit.currentID = 0;
            //

            Game.play();
          });
        });
        survey.render("surveyElement");

      }
    });

  } else if (Game.inPerformance) {

    console.log("Regresando a performance")
    Game.layerSwitchTo('GameStart')
    // Game.performanceSecondRound = true
    if (Game.performanceFirstRound && !Game.performanceSecondRound && !Game.performanceThirdRound) {
      Game.layerSwitchTo("GameStart");
      console.log("Finishing In First Round Monitoring session")
      $.ajax({
        type: "POST",
        url: 'php/insertParticipantPerformance.php',
        data: {
          participantId: Game.idParticipant,
          trials: JSON.stringify(Game.trialPerformanceResult),
          replay: JSON.stringify(Game.replay)
        },

        success: function (data) {
          Game.layerSwitchTo("GameStart");
          Game.isPerformanceRoundOne = !Game.isPerformanceRoundOne;
          console.log('%c Starting second roundPerformance session! SUCCESS', 'background: #aaaacc; color: 99ffdd');
          //                        console.log("Saved " + data);
          console.log('%c BEFORE MONITORING TASK ! ', 'background: #aaaacc; color: 99ffdd');


          var json = {
            title: "Communicating Uncertainties",
            showProgressBar: "top",
            pages:

            [

              {
                title: "Monitoring Task Second Part",
                questions:
                [
                  {


                    type: "html",
                    name: "Summary",
                    html: '<h1> Monitoring Task</h1>' +
                    '<b>If you need to, please take a quick break now.</b><br></br>' +
                    'When you are ready to continue, please press complete.<br/><br/> ' +
                    'Remember, you need to click on a craft when you\n' +
                    'notice that it changes status.<br/><br/>  <br/><b>Do not to switch between browser tabs or your participation could be voided.</b>',

                  }
                ]
              }


            ]
          };

          Survey
          .StylesManager
          .applyTheme("winterstone");
          var survey = new Survey.Model(json);

          survey.onComplete.add(function (result) {
            console.log("OnCompleteSegundo survey");
            $('.sv_body.sv_completed_page').hide();
            $(function () {
              Game.teams = {};
              Game.firstTrial = true;
              Game.mainTick = 0;
              Game.commands = {};
              Game.inPerformance = true;
              Game.replay = {};
              Participation.cmds = [];
              Game.resources = 0;
              Game.selectedUnit = {};
              Game.trialByClick = true;
              Game.idPreviousEntity = -1;
              clearInterval(Game.refreshIntervalId);
              Game.performanceTrial = 0;
              Game.trialPerformanceResult = {};
              Game.idCurrentEntityChanged = -1;
              Game.idPreviousEntity = -1;
              Game.previousCategory = "";
              Game.currentCategory = "";
              performanceStreak: '';
              Game.performanceFirstRound = true;
              Game.performanceSecondRound = true;

              //deleting every unit
              Unit.allUnits.splice(0, Unit.allUnits.length);
              Unit.currentID = 0;
              //
              Game.play();
            });
          });
          survey.render("surveyElement");

        }
      })
    } else if (Game.performanceFirstRound && Game.performanceSecondRound && !Game.performanceThirdRound) {
      Game.layerSwitchTo("GameStart");
      console.log("Finishing In Second Round Monitoring session")
      $.ajax({
        type: "POST",
        url: 'php/insertParticipantPerformance2ndRound.php',
        data: {
          participantId: Game.idParticipant,
          trials: JSON.stringify(Game.trialPerformanceResult),
          replay: JSON.stringify(Game.replay)
        },

        success: function (data) {
          Game.layerSwitchTo("GameStart");
          Game.isPerformanceRoundOne = !Game.isPerformanceRoundOne;
          console.log('%c Starting second roundPerformance session! SUCCESS', 'background: #aaaacc; color: 99ffdd');
          //                        console.log("Saved " + data);
          console.log(" PERFOMANCE  case with 12? ", Game.isPerformanceRoundOne);
          intracondition = Game.isPerformanceRoundOne ? "without" : "with";//12 or 24

          console.log('%c BEFORE MONITORING TASK ! ', 'background: #aaaacc; color: 99ffdd');


          var json = {
            title: "Communicating Uncertainties",
            showProgressBar: "top",
            pages:

              [

                {
                  title: "Monitoring Task Third Part",
                  questions:
                  [
                    {


                      type: "html",
                      name: "Summary",
                      html: '<h1> Monitoring Task</h1>' +
                      '<b>If you need to, please take a quick break now.</b><br></br>' +
                      'When you are ready to continue, please press complete.<br/><br/> ' +
                      'Remember, you need to click on a craft when you\n' +
                      'notice that it changes status.<br/><br/>  <br/><b>Do not to switch between browser tabs or your participation could be voided.</b>',

                    }
                  ]
                }]
          }

          Survey
            .StylesManager
            .applyTheme("winterstone")
          var survey = new Survey.Model(json)

          survey.onComplete.add(function (result) {
            console.log("OnCompleteSegundo survey")
            $('.sv_body.sv_completed_page').hide()
            $(function () {
              Game.teams = {}
              Game.firstTrial = true
              Game.mainTick = 0
              Game.commands = {}
              Game.inPerformance = true
              Game.replay = {}
              Participation.cmds = []
              Game.resources = 0
              Game.selectedUnit = {}
              Game.trialByClick = true
              Game.idPreviousEntity = -1
              clearInterval(Game.refreshIntervalId)
              Game.performanceTrial = 0
              Game.trialPerformanceResult = {}
              Game.idCurrentEntityChanged = -1
              Game.idPreviousEntity = -1
              Game.previousCategory = ""
              Game.currentCategory = ""
              performanceStreak: ''
              Game.performanceFirstRound = true
              console.log("***********************")
              Game.performanceSecondRound = true
              Game.performanceThirdRound = true

              // deleting every unit
              Unit.allUnits.splice(0, Unit.allUnits.length);
              Unit.currentID = 0;
              //
              Game.play()
            })
          })
          survey.render("surveyElement")
        }
      })
    } else {
      if (Game.performanceFirstRound && Game.performanceSecondRound && Game.performanceThirdRound) {
        // End of experiment
        Game.inPerformance = false
        console.log('%c Finishing performance session Block 3', 'background: #aaaacc; color: 99ffdd')
        $.ajax({
          type: "POST",
          url: 'php/insertParticipantPerformance3rdRound.php',
          data: {
            participantId: Game.idParticipant,
            trials: JSON.stringify(Game.trialPerformanceResult),
            replay: JSON.stringify(Game.replay),
          },
          success: function (data) {
          //alert("grabado");
            Game.layerSwitchTo("GameStart");
            console.log('%c ENDING PARTICIPATION Monitoring Session DONE! SUCCESS', 'background: #aaaacc; color: 99ffdd');
            //console.log("Saved " + data);
            console.log('%c FInish Performance Monitoring task session! ', 'background: #aaaacc; color: 99ffdd');
            var json = {
              title: "DEBRIEF",
              showProgressBar: "top",
              pages:
              [{
                title: "Monitoring Task Finished", questions: [{
                  type: "html", name: "Summary",
                  html: WebPages.monitoringTaskComplete
                }]
              }]
            }
            var survey = new Survey.Model(json);

            survey.onComplete.add(function (result) {
              console.log("OnCompleteSegundo survey");
              $('.sv_body.sv_completed_page').hide();
              $(function () {
                console.log('%c Performance sessionTRUE ', 'background: #77ffcc; color: 99ffdd');
                //    console.log('%c FALTA DIRECCION CALLBACK PROLIFIC for Performance session! ', 'background: #aaaacc; color: 99ffdd');
                Game.finish();
              });

            });

            survey.render("surveyElement");
          } // end success
        }) // end ajax

      } // End of if all blocks done
    } // End of else, for ifs setting blocks
  } // End of if inPerformance
},
