var Referee = {
        timerExperiment: 0,
        _pos: [[-1, 0], [1, 0], [0, -1], [0, 1]],//Collision avoid
        tasks: ['judgeCollision', 'judgeWinLose', 'changeIdentity', 'startEntities', 'unselectThings'],

        startEntities: function () {
            if (Game.mainTick == 1) {
                Game.setRandomPosition();
            }
        }
        ,
        unselectThings: function () {
            if (Game.mainTick % 10 == 0) {
                Game.unselectAll();
            }
        }
        ,
        winCondition: function () {

            // console.log(" Checando win" + Game.timerExperiment);
            if (Game.inTraining) {
                //  console.log(" current %d streak %s",Game.lastNTrainingTrials ,  Game.trainingStreak);
                numTrials = Game.trainingStreak.length;
                if (numTrials >= Game.lastNTrainingTrials && numTrials < Game.maxTrainingTrials) {

                    currentStreak = Game.trainingStreak.slice(Game.trainingStreak.length - Game.lastNTrainingTrials, Game.trainingStreak.length)
                    // console.log(" ADENTRO current %d streak %s",Game.lastNTrainingTrials , currentStreak);
                    correctTrials = currentStreak.count("r")
                    //console.log(" correctos %d de los ultimos %d     history %s  necesito %d ", correctTrials,Game.lastNTrainingTrials , Game.trainingStreak,  Game.correctLastNTrainingTrials);
                    if (correctTrials >= Game.correctLastNTrainingTrials) {
//                        console.log("entrenado")
                        return true;
                    }
                }
                return false;
            }
            if (Game.inPractice) {
                if (Game.practiceTrial < Game.maxPracticeTrial) {
                //    console.log("Terminar Practica");
                    return false;
                }else return true;

            }
            if (Game.inPerformance) {
                if (Game.performanceTrial < Game.maxPerformanceTrial) {
                        //console.log("Finish MOnitoring");
                    return false;
                }else return true;
            }
            return true;
        }
        ,
        loseCondition: function () {

            if (Game.inTraining) {
                tiempoNegativo = Game.timerExperiment < 0;
                properlyTrained = false
                trialsExhausted = Game.trainingTrial > Game.maxTrainingTrials;

                if (tiempoNegativo) {
                    console.log("TIME OVER")
                    var o = Game.trialTrainingResult;
                    for (var key in o) {
                        if (o.hasOwnProperty(key)) {
                            console.log(" Trial " + key + "  Result " + o[key]);
                        }
                    }
                }
                if (trialsExhausted) {
                    console.log("Too Many Trials")
                    Game.showMessage("Too Many Trials", false)
                    return true;
                }
                return (trialsExhausted || tiempoNegativo);
            }
            if (Game.inPractice) {
                tiempoNegativo = Game.timerExperiment < 0;


                if (tiempoNegativo) {
                    console.log("TIME OVER PRACTICE")

                    for (var key in o) {
                        if (o.hasOwnProperty(key)) {
                            console.log(" Trial " + key + "  Result " + o[key]);
                        }
                    }
                }
                return (tiempoNegativo);
            }
            return false;
        }
        ,

        judgeReachDestination: function (chara) {
            //Idle but has destination
            //console.log("judge reach destination")
            if (chara.destination && chara.isIdle()) {
                //Already here
                if (chara.insideSquare({
                    centerX: chara.destination.x,
                    centerY: chara.destination.y,
                    radius: Unit.moveRange
                })) {
                    //Has next destination
                    if (chara.destination.next) {
                        chara.destination = chara.destination.next;
                        chara.moveTo(chara.destination.x, chara.destination.y);
                        chara.targetLock = false;
                    }
                    //No more destination
                    else {
                        delete chara.destination;
                    }
                }
                //Continue moving
                else {
                    chara.moveTo(chara.destination.x, chara.destination.y);
                    chara.targetLock = false;
                }
            }
        }
        ,


        advanceNextTrial: function () {

            //console.log("In Advance Next Trial");
            Game.updateTrialTrainingLogic();
            Game._timerIntervalTraining = -1;
        },

        blackScreenTimedOut: function () {
            Game.freeze = true;
            $('#panel_Info').html('');
            setTimeout(Referee.advanceNextTrial, Game.blackScreenTraining);
        },

        changeIdentity: function () {

            if (Game.inTraining) {
                if (Game.mainTick == Game.nextCheckJudgeEntity) { //every 5 seconds
                    if (!Game.trainingStarted) {
                        Game.trainingStarted = true
                        Referee.advanceNextTrial();
                        return;
                    }
                    if (!Game.trialByClick) {
                        //console.log("TIMED OUT")
                        Game.inFeedbackTraining = true;
                        //if (!Game.firstTrial) {
                        if (Game._timerIntervalTraining == -1) {
                            // console.log(" once Referre" +Game.mainTick);
                            Game._timerIntervalTraining = setTimeout(Referee.blackScreenTimedOut, 1);
                        }

                    } else {
//                        console.log("Click Options  ")
                        Game.updateTrialTrainingLogicClickDelay();
                    }
                }
            }
            if (Game.inPractice) {
                if (Game.mainTick == Game.nextCheckJudgeEntity) { //every 5 seconds
                            console.log("Actualizando  fue por TIMEOUT")
                            Game.updateTrialTrainingLogic();
                }
            }
            if (Game.inPerformance) {
//                console.log( " Main tick performance %d last check %d , next check %d", Game.mainTick , Game.lastCheckJudgeEntity, Game.nextCheckJudgeEntity )
                if (Game.mainTick == Game.nextCheckJudgeEntity) { //every 5 seconds
                    if (!Game.trialByClick) {
                       // console.log("Actualizando  fue por TIMEOUT")
                        Game.updateTrialTrainingLogic();
                    }
                }
            }
        }
        ,
//Avoid collision
        judgeCollision: function () {
            //N*N->N
            var units = Unit.allUnits;
            for (var N = 0; N < units.length; N++) {
                var chara1 = units[N];
                for (var M = N + 1; M < units.length; M++) {
                    var chara2 = units[M];
                    var dist = chara1.distanceFrom(chara2);
                    //Ground unit collision limit
                    var distLimit;
                    if (chara2 instanceof Unit) {
                        distLimit = (chara1.radius() + chara2.radius()) * 3;
                        if (distLimit < Unit.meleeRange) distLimit = Unit.meleeRange;//Math.max
                    }
                    //Separate override ones
                    if (dist == 0) {
                        var colPos = Referee._pos[Game.getNextRandom() * 4 >> 0];
                        if (chara1 instanceof Unit) {
                            chara1.x += colPos[0];
                            chara1.y += colPos[1];
                            dist = 1;
                        } else {
                            if (chara2 instanceof Unit) {
                                chara2.x += colPos[0];
                                chara2.y += colPos[1];
                                dist = 1;
                            }
                        }
                    }
                    if (dist < distLimit) {
                        //Collision flag
                        chara1.collision = chara2;
                        chara2.collision = chara1;
                        //Adjust ratio
                        var K = (distLimit - dist) / dist / 2;
                        var adjustX = K * (chara1.x - chara2.x) >> 0;
                        var adjustY = K * (chara1.y - chara2.y) >> 0;
                        //Adjust location
                        var interactRatio1 = 0;
                        var interactRatio2 = 0;


                        //Unit VS Unit
                        if (chara2 instanceof Unit) {
                            if (chara1.status == "moving") {
                                //Move VS Move
                                if (chara2.status == "moving") {
                                    interactRatio1 = 1;
                                    interactRatio2 = 1;
                                }
                                //Move VS Dock
                                else {
                                    interactRatio1 = 2;
                                    interactRatio2 = 0;
                                }
                            } else {
                                //Dock VS Move
                                if (chara2.status == "moving") {
                                    interactRatio1 = 0;
                                    interactRatio2 = 2;
                                }
                                //Dock VS Dock
                                else {
                                    interactRatio1 = 1;
                                    interactRatio2 = 1;
                                }
                            }
                        }


                        chara1.x += interactRatio1 * adjustX;
                        chara1.y += interactRatio1 * adjustY;
                        chara2.x -= interactRatio2 * adjustX;
                        chara2.y -= interactRatio2 * adjustY;
                    }
                }
            }
        }
        ,
        judgeWinLose: function () {
         /*     if(!document.hasFocus()){
                  Game.interruptions =Game.interruptions +1;
                    //console.log("Focus lost")
              }*/

            if (Game.timerExperiment <= -1) {
                if (Game.refreshIntervalId) {
                    clearInterval(Game.refreshIntervalId);
                }
            }
            if (Game.mainTick % 10 == 0) {
//            console.log(" Judge win lose " + Game.timerExperiment);
                if (Referee.loseCondition()) {
                    Game.lose();
                }
                if (Referee.winCondition()) {
                    Game.win();
                }

            }
        }

    }
;
