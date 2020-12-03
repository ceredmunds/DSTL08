var Game = {
  // Global variables
  HBOUND: 800, // $('body')[0].scrollWidth
  VBOUND: 800, // $('body')[0].scrollHeight
  infoBox: {
    x: 145,
    y: innerHeight - 110,
    width: innerWidth - 295,
    height: 110
  },
  inGame: false,

  // ITI time ranges
  smithShowUpTime: 2000, //in miliseconds
  ITIMinStartTime: 500,//in miliseconds ORIGINAL 500
  ITIMaxStartTime: 2000,//in miliseconds
  currentITI: -1,

  colourDescription: {},
  //variables to control training and session durantion
  trainingStarted: false,

  firstTrial: false,

  // Training Section
  trainingTimeInterval: 250,
  blackScreenTraining: 500,
  feedbackTime: 1500,
  _timerIntervalTraining: -1,
  inFeedbackTraining: false,
  trainingDuration: 25000000,
  maxTrainingTrials: 100,
  lastNTrainingTrials: 10,
  correctLastNTrainingTrials: 8,
  trainingStreak: '',
  trialTrainingResult: {},
  inTraining: false,
  trainingTrial: 0,
  correctTrainingTrials: 0,
  smithsTurn: false,

  // Practice Section
  trialPracticeResult: {},
  practiceDuration: 150000,
  practiceStreak: '',
  inPractice: false,
  practiceTrial: 0,
  numStimuliTraining: 6,
  maxPracticeTrial: 3, // test rapid
  categoriesRemaining: [],

  freeze: false,

  trialInitialTime: 0,
  trialEndTime: -1,
  startingTick: -1,
  endingTick: -1,

  // Performance
  performanceStreak: '',
  performanceDuration: 350000,
  trialPerformanceResult: {},
  inPerformance: false,
  performanceTrial: 0,
  maxPerformanceTrial: 30,
  performanceFirstRound: false,
  performanceSecondRound: false,
  performanceThirdRound: false,
  isPerformanceRoundOne: true,
  isTrialNoChange: false,
  trial_description: '',

  interruptions: 0,

  /* Gameplay */
  minFrames: 250,
  maxFrames: 250,
  nextCheckJudgeEntity: 50, // check time to init
  lastCheckJudgeEntity: 0,
  trialByClick: false,
  idCurrentEntityChanged: -1,
  idPreviousEntity: -1,
  previousCategory: '',
  currentCategory: '',

  replay: {},
  mapping: {},
  categoriesByCondition: [],

  entitiesByCategory: {},
  categoryIndex: 0,
  surveyData: '',
  playerNum: 2,

  Participation: false,//By default
  cxt: $('#middleCanvas')[0].getContext('2d'),
  frontCxt: $('#frontCanvas')[0].getContext('2d'),
  backCxt: $('#backCanvas')[0].getContext('2d'),
  fogCxt: $('#fogCanvas')[0].getContext('2d'),
  _timer: -1,
  _fps: 50,
  _frameInterval: 1000 / 50,  //50 ticks per second
  mainTick: 0,

  commands: {},
  replay: {},
  randomSeed: 0,//For later use
  selectedUnit: {},
  allSelected: [],
  _oldAllSelected: [],

  toggleClock: true,
  CDN: '',

  // DB STUFF
  idParticipant: -1,
  //#######################################################################
  conditionExperiment: 4,  //##########################################
  //#########################################################################################
  sessionID: -1,
  prolificID: -1,
  refreshIntervalId: undefined,
  timerExperiment: 0,

  trialPath1: [], // for 12 entities - first block
  trialPath2: [], // for 24 entities - second block
  trialPath3: [], // third block

  timer: 0,
  minutes: 0,
  seconds: 0,
  //
  startClock: function () {

    //$('div.warning_Box').show();
    if (Game.toggleClock) {
      timer = 0;
      if (Game.inTraining) {
        //                console.log("Starting training clocl")
        timer = Game.trainingDuration;
      }
      if (Game.inPractice) {
        //                    console.log("Starting practice clock")
        timer = Game.practiceDuration;
      }
      if (Game.inPerformance) {
        //                  console.log("Starting performance clocl")
        timer = Game.performanceDuration;
      }
      //	console.log( " starting clock with " + timer )

      timer = timer * 2 / 1000;
      minutes = 0
      seconds = 0;

    } else {
      $('div.warning_Box').hide();

    }
  },

  stopAnimation: function () {
    if (Game._timer !== -1) clearInterval(Game._timer)
    Game._timer = -1
  },

  startAnimation: function () {
    if (Game._timer === -1) {
      Game._timer = setInterval(Game.animation.loop, Game._frameInterval)
    }
  },

  stop: function (charas) {
    charas.forEach(function (chara) {
      chara.stop();
    });
    Game.stopAnimation();
  },

  updateClock: function () {

    minutes = parseInt(timer / 60, 10)
    seconds = parseInt(timer % 60, 10);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    $('div.warning_Box').html(minutes + ":" + seconds);
    Game.timerExperiment = timer;


    if (--timer < 0) {

      Referee.judgeWinLose();
    }

  },
  addIntoAllSelected: function (chara, override) {
    if (chara instanceof Gobj) {
      //Add into allSelected if not included
      if (Game.allSelected.indexOf(chara) == -1) {
        if (override) Game.allSelected = chara;
        else Game.allSelected.push(chara);
        chara.selected = true;
      }
    }
    //Override directly
    if (chara instanceof Array) {
      if (override) Game.allSelected = chara;
      else chara.forEach(function (char) {
        //Add into allSelected if not included
        if (Game.allSelected.indexOf(char) == -1) Game.allSelected.push(char);
      });
      chara.forEach(function (char) {
        char.selected = true;
      });
    }

    //Notify referee to redraw
    // Referee.alterSelectionMode();
  },
  //To replace setTimeout
  commandTimeout: function (func, delay) {
    var dueTick = Game.mainTick + (delay / 100 >> 0);
    if (!Game.commands[dueTick]) Game.commands[dueTick] = [];
    Game.commands[dueTick].push(func);
  },
  //To replace setInterval
  commandInterval: function (func, interval) {
    var funcAdjust = function () {
      func();
      Game.commandTimeout(funcAdjust, interval);
    };
    Game.commandTimeout(funcAdjust, interval);
  },
  layerSwitchTo: function (layerName) {
    $('div.GameLayer').hide();
    $('#' + layerName).show(); //show('slow')
  },

  getScriptedTrials: function () {
    var randomTrialPath = Game.randomIntFromInterval(0, TrialsRatio.trialsRatio15.length - 1)
    var completeTrialPath = TrialsRatio.trialsRatio15[randomTrialPath]

    Game.trialPath1 = completeTrialPath.slice(0, (completeTrialPath.length / 3))
    Game.trialPath2 = completeTrialPath.slice((completeTrialPath.length / 3), 2 * (completeTrialPath.length / 3))
    Game.trialPath3 = completeTrialPath.slice(-(completeTrialPath.length / 3))
  },

  init: function () {
    //            console.log("init Game " + Game.conditionExperiment)

    Game.getMapping();
    Game.inTraining = true;
    Game.firstTrial = true;

    //TrialRatio
    Game.getScriptedTrials();
    Game.createParticipant();

    //Prevent full select
    $('div.GameLayer').on("selectstart", function (event) {
      //console.log("select start")
      event.preventDefault();
    });
    //Bind resize canvas handler
    //  window.onresize = Game.resizeWindow;
    window.requestAnimationFrame = requestAnimationFrame || webkitRequestAnimationFrame
    || mozRequestAnimationFrame || msRequestAnimationFrame || oRequestAnimationFrame;//Old browser compatible*/

    //Start loading
    Game.layerSwitchTo("GameLoading");
    sourceLoader.load("img", Game.CDN + "img/military/gray.png", "gray");
    sourceLoader.load("img", Game.CDN + "img/military/blue.png", "blue");

    sourceLoader.load("img", Game.CDN + "img/military/purple.png", "purple");
    sourceLoader.load("img", Game.CDN + "img/military/green.png", "green");

    sourceLoader.load("img", Game.CDN + "img/military/yellow.png", "yellow");
    sourceLoader.load("img", Game.CDN + "img/military/red.png", "red");

    sourceLoader.load("img", Game.CDN + "img/military/aGreen.png", "c_green");
    sourceLoader.load("img", Game.CDN + "img/military/aRed.png", "c_red");
    sourceLoader.load("img", Game.CDN + "img/military/aBlue.png", "c_blue")

    sourceLoader.load("img", Game.CDN + "img/military/grayTraining.png", "grayTraining");
    sourceLoader.load("img", Game.CDN + "img/military/blueTraining.png", "blueTraining");

    sourceLoader.load("img", Game.CDN + "img/military/purpleTraining.png", "purpleTraining");
    sourceLoader.load("img", Game.CDN + "img/military/greenTraining.png", "greenTraining");


    sourceLoader.load("img", Game.CDN + "img/military/yellowTraining.png", "yellowTraining");
    sourceLoader.load("img", Game.CDN + "img/military/redTraining.png", "redTraining");

    sourceLoader.load("img", Game.CDN + "img/military/aGreenTraining.png", "c_greenTraining");
    sourceLoader.load("img", Game.CDN + "img/military/aRedTraining.png", "c_redTraining");
    sourceLoader.load("img", Game.CDN + "img/military/aBlueTraining.png", "c_blueTraining");

    // Map
    sourceLoader.load("img", Game.CDN + "img/qmul/prueba1.png", "Map_Grass")

    // Extra
    sourceLoader.load("img", Game.CDN + "img/Bg/qmul-logo.png", "GameWin");
    sourceLoader.load("img", Game.CDN + "img/Bg/qmul-logo.png", "GameLose");


    sourceLoader.allOnLoad(function () {
      $('#GameWin').prepend(sourceLoader.sources['GameWin']);
      $('#GameLose').prepend(sourceLoader.sources['GameLose']);
      $('#GamePlay>canvas').attr('width', Game.HBOUND);//Canvas width adjust
      $('#GamePlay>canvas').attr('height', Game.VBOUND);//Canvas height adjust

      Game.start();
    })
  },

  start: function () {
    Game.layerSwitchTo("GameStart")
    $('div.panel_Map').hide()
    $('div.panel_Control').hide()

    var level = Game.conditionExperiment;
    if (Game.inTraining) {
      $('div.panel_Info').show();
      //    console.log("Modo tutorial")
      $('.levelSelectionBg').append("<div class='PsyRTSButton'><p></p><input type='button'  class='sv_next_btn' value='Start Training' name='levelSelect'></input></div>");
    }

    //Wait for user select level and play game
    $('input[name="levelSelect"]').click(function () {
      if (Game.level != null) return;

      Game.level = Game.conditionExperiment;

      Game.play();
    });
  },

  getCategoriesByCondition: function () {
    console.log(" in categories get " + Game.conditionExperiment)
    if (Game.conditionExperiment === 1 || Game.conditionExperiment === 4) {
      Game.categoriesByCondition = [Category.HOSTILE, Category.NEUTRAL, Category.UNKNOWN, Category.FRIEND]
    } else {
      Game.categoriesByCondition = [Category.HOSTILE, Category.NEUTRAL, Category.ASSUMED_FRIEND, Category.ASSUMED_HOSTILE, Category.UNKNOWN, Category.FRIEND]
    }
  },

  loadCondition: function () {
    Map.setCurrentMap('Grass');
    Map.offsetX = 0;
    Map.offsetY = 0;
    Unit.allUnits = [];

    Map.fogFlag = false;//niebla total
    Game.inTraining = true;

    typeEntities = Game.categoriesByCondition.length;

    numStimuli = 1;

    for (i = 0; i < numStimuli; i++) {
      e1 = new Entity({x: 325, y: 400});
      e1.fakeid = Game.makeFakeID(6);
      e1.category = Game.categoriesByCondition[i % typeEntities];
      Unit.allUnits.push(e1);
      //debugger; // execution will pause at this line
      if ((e1.x > 800 || e1.x < 0) || (e1.y > 800 || e1.y < 0)) {
        console.log("Out of grid")
      }
    }

    Game.startClock();
  },


  play: function () {
    elem = document.documentElement
    function openFullscreen () {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen()
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen()
      }
    }
    openFullscreen()

    //Load level to initial when no error occurs
    $('div.debug_Box').hide();
    Game.startClock();
    if (Game.inTraining) {
      openFullscreen()

      $('div.warning_Box').hide();
      $('div.smith_Box').html("Smith's Turn").hide()
      $('canvas[name="radar"]').hide()

      Game.loadCondition();
      Game.expandUnitProps();
      Game.freeze = true;
      console.log("Game.play Training")
    } else if (Game.inPractice) {
      openFullscreen()

      $('div.warning_Box').hide();
      $('div.smith_Box').html("<p>Smith's Turn</p>").show()
      $('div.panel_Info').hide();

      if (Game.conditionExperiment >= 4) {
        $('canvas[name="radar"]').show()
      } else {
        $('canvas[name="radar"]').hide()
      }

      Game.updateEntities();

      Game.intervalTrialSmith();
    } else if (Game.inPerformance) {
      openFullscreen()

      $('div.warning_Box').hide();
      $('div.panel_Info').hide();

      if (Game.conditionExperiment >= 4) {
        $('canvas[name="radar"]').show()
      } else {
        $('canvas[name="radar"]').hide()
      }

      console.log("Game.play Performance")
      Game.updateEntities();
      Game.intervalTrialSmith();
    }

    //Game background
    Game.layerSwitchTo("GamePlay");
    Game.resizeWindow();

    //Bind controller
    mouseController.toControlAll();//Can control all units
    keyController.start();//Start monitor
    Game.inGame = true;
    Game.resetEntitiesByCategory();
    Game.setRandomPosition();
    Game.animation();
  },

  resetEntitiesByCategory: function () {
    Game.categoriesByCondition.forEach(function (category) {
      //            console.log("creando categoria " +category)
      Game.entitiesByCategory[Category.getLabel(category)] = 0;
    });
  },

  getPropArray: function (prop) {
    var result = [];
    for (var N = 0; N < Game.playerNum; N++) {

      result.push(typeof (prop) == 'object' ? (_$.clone(prop)) : prop);
    }
    return result;
  },
  //Do we need this because we only support Predator vs Human vs Competitor?
  expandEntitySpeed: function () {


    _$.traverse([Entity], function (unitType) {
      ['speed'].forEach(function (prop) {
        //Prop array, first one for us, second for enemy
        if (unitType.prototype[prop] != undefined) {
          unitType.prototype[prop] = 1;
        }
      });
    });
  },
  expandUnitProps: function () {


    _$.traverse([Entity], function (unitType) {
      ['speed'].forEach(function (prop) {
        //Prop array, first one for us, second for enemy
        if (unitType.prototype[prop] != undefined) {
          unitType.prototype[prop] = Game.getPropArray(unitType.prototype[prop]);
        }
      });
    });
  },
  unselectAll: function () {
    //Unselect all
    var units = Unit.allUnits;
    units.forEach(function (chara) {
      chara.selected = false

    });
    Game.addIntoAllSelected([], true);
  },

  getSelectedOne: function (clickX, clickY) {
    var distance = function (chara) {
      return (clickX - chara.posX()) * (clickX - chara.posX()) + (clickY - chara.posY()) * (clickY - chara.posY());//Math.pow2
    };
    //Initial

    //    console.log("usando esta")
    var selectedOne = {}, charas = [];

    charas = Unit.allUnits;
    //customFilter is filter function

    //Find nearest one
    selectedOne = charas.filter(function (chara) {
      return chara.status != 'dead' && chara.includePoint(clickX, clickY);
    }).sort(function (chara1, chara2) {
      return distance(chara1) - distance(chara2);
    })[0];
    if (!selectedOne) selectedOne = {};

    return selectedOne;
  },
  changeSelectedTo: function (chara) {
    Game.selectedUnit = chara;
    if (chara instanceof Gobj) {
      chara.selected = true;
    }
  },

  getCircleColor: function (chara) {

    Category.getLabel(chara.category);
    cat = chara.category;
    color = Game.mapping["" + cat];
    desc = Colour.getLabel(color)
    if (Game.inTraining) {
      //            console.log("Asset training cat %d color %d desc %s ", cat, color, desc.toLowerCase())
      return desc.toLowerCase() + "Training"

    } else {
      //          console.log("Asset normal cat %d color %d desc %s ", cat, color, desc.toLowerCase())
      return desc.toLowerCase()

    }
  },

  draw: function (chara) {
    //Can draw units and no-rotate bullets
    if (!(chara instanceof Gobj)) return;//Will only show Gobj
    //Won't draw units outside screen
    if (!chara.insideScreen() || !chara.visible)
    //        {   console.log("No esta adentro de la pantalla")
    return;
    //      }
    //Choose context
    var cxt = (chara instanceof Unit) ? Game.cxt : Game.frontCxt;


    // if (! chara.visible ) return
    //Draw unit or building
    var imgSrc;
    circleColor = Game.getCircleColor(chara);


    imgSrc = sourceLoader.sources[circleColor];

    //Convert position
    var charaX = (chara.x - Map.offsetX) >> 0;
    var charaY = (chara.y - Map.offsetY) >> 0;
    //Same image in different directions

    var _left = 0;
    var _top = 0;


    if (Game.inTraining) {

      if (!Game.freeze) {

        cxt.drawImage(imgSrc, _left, _top, 150, 150, charaX, charaY, 150, 150);
        cxt.restore();
      }


    } else {
      cxt.drawImage(imgSrc, _left, _top, chara.width, chara.height, charaX, charaY, chara.width, chara.height);


      cxt.restore();
      var offsetY = -6;
      //Draw HP if has selected and is true

      if (chara.selected == true) {
        //    cxt = Game.frontCxt;

        cxt.strokeStyle = "white";//Distinguish enemy
        cxt.lineWidth = 2;//Cannot see 1px width circle clearly
        cxt.beginPath();

        //radiodibujo = chara.radius();
        radiodibujo = 15;


        cxt.arc(chara.posX() - Map.offsetX, chara.posY() - Map.offsetY, radiodibujo, 0, 2 * Math.PI);

        cxt.stroke();
        cxt.lineWidth = 1;
        cxt.strokeStyle = "white";


      }
      if (chara.name == "entity") { //poner halo azul en el mineral
        cxt.restore();
        cxt.fillStyle = "rgb(255, 255, 255)"
        cxt.font = '10px verdana';
        cxt.fillText(chara.fakeid, chara.x - Map.offsetX, chara.y - Map.offsetY + offsetY);
        // cxt.fillText(chara.id, chara.x - Map.offsetX, chara.y - Map.offsetY + offsetY);

      }
    }


  },
  drawSourceBox: function () {
    var msgSession = ""
    if (Game.inTraining) {
      msgSession = "Training"
    } else if (Game.inPractice) {
      msgSession = "Practice"
    } else if (Game.inPerformance) {
      msgSession = "Performance"
    }
    $('div.debug_Box span.debug>span')[0].innerHTML = "Session: " + msgSession;
    if (Game.inTraining) {
      $('div.debug_Box span.debug>span')[1].innerHTML = "Streak: " + Game.trainingStreak;
      $('div.debug_Box span.debug>span')[2].innerHTML = "Current trial: " + Game.trainingTrial;
    } else if (Game.inPractice) {
      $('div.debug_Box span.debug>span')[1].innerHTML = "Streak: " + Game.practiceStreak;
      $('div.debug_Box span.debug>span')[2].innerHTML = "Current trial: " + Game.practiceTrial;
    }
    if (Game.inPerformance) {
      $('div.debug_Box span.debug>span')[1].innerHTML = "Streak: " + Game.performanceStreak;
      $('div.debug_Box span.debug>span')[2].innerHTML = "Current trial: " + Game.performanceTrial;
    }
    $('div.debug_Box span.debug>span')[3].innerHTML = "Current entity changed: " + Game.idCurrentEntityChanged;
    $('div.debug_Box span.debug')[0].style.color = "'rgb(0, 22, 230)'";
  },
  trainingButton: function (choiceText, choiceValue) {

    if (Game.inTraining && !Game.freeze) {
      Game.freeze = true;
      Game.trialEndTime = Game.getCurrentTs().getTime();
      Game.endingTick = Game.mainTick;
      $('#panel_Info :input').attr('disabled', true);
      $('#panel_Info :input').css("color", 'rgba(68,68,68,0.61)');
      $('#panel_Info :input').css("backgroundColor", 'rgba(0,0,0,0.55)');

      var entidad
      Unit.allUnits.forEach(function (chara) {
        if (chara.id == Game.idCurrentEntityChanged) {
          entidad = chara
        }
      })

      var correct;
      if (entidad.category == choiceValue) {
        correct = true;
        $('#panel_Info').append('<br/><br/><br/><br/><br/><p style="color:white;">Correct </p><br/>It was: ' + choiceText);
        console.log(" %c CORRECT ", 'background: #00ff00')
        Game.updateTrainingStreak("Correct Entity Detected ", true);
        Game.trialTrainingResult["" + Game.trainingTrial] = true
      } else {
        correct = false;
        $('#panel_Info').append('<br/><br/><br/><br/><br/><p style="color:white;">Incorrect </p><br/>It was: ' + Category.getUILabel(entidad.category));
        console.log(" %c WRONG ", 'background: #ff0000')
        Game.updateTrainingStreak("Wrong Entity Detected ", false);
        Game.trialTrainingResult["" + Game.trainingTrial] = false
      }

      //new
      reaction_time =  Game.trialEndTime - Game.trialInitialTime
      if (reaction_time === 'NA' || reaction_time === 'N/A') {
        console.log(" %c  REACTION_TIME %i ", 'background: #ddddff', reaction_time)
      } else {

        //                    console.log(" %c  REACTION_TIME ANTES%i ", 'background: #ddddff', reaction_time)
        if (reaction_time > 5000) reaction_time = reaction_time % 5000 //because people swithces tabs
        //                  console.log(" %c  REACTION_TIME DESPUES%i ", 'background: #ddddff', reaction_time)
      }
      currenttrial = {
        type: 'completeTrial',
        category_learning_trial: Game.trainingTrial,
        condition_experiment: Game.conditionExperiment,
        tick: Game.mainTick,
        completed_by: "CLICKED",
        participant_id: Game.idParticipant,
        starting_time_trial: Game.trialInitialTime,
        finishing_time_trial: Game.trialEndTime,
        starting_tick: Game.startingTick,
        ending_tick: Game.endingTick,
        reaction_time: reaction_time,
        reaction_tick: Game.endingTick - Game.startingTick,
        category: Category.getLabel(entidad.category),
        category_id: entidad.category,
        category_selected: Category.getLabel(choiceValue),
        category_selected_id: choiceValue,
        correct: correct
      }
      Participation.cmds = [];
      //Game.storeData({'completeTrial': currenttrial}, true, true)
      Game.storeData({'complete_category_learning_trial': currenttrial}, true, true)
      Participation.cmds = [];
      //new

      Game.inFeedbackTraining = true;
      if (Game._timerIntervalTraining == -1) {
        //                    console.log(" once " + Game.mainTick);
        Game._timerIntervalTraining = setTimeout(Game.blackScreenBetweenTrials, Game.feedbackTime);
      }


    } else {
      console.log(" %c Error, it is a practice button ", 'background: #ff0000')
    }
  }
  ,
  //For use in the category learning Task
  blackScreenBetweenTrials: function () {
    if (Game.inTraining) {
      //            console.log("blackScreenBetweenTrials!")
      $('#panel_Info').html('');
      setTimeout(Game.advanceNextTrial, Game.blackScreenTraining);
    }
  }

  ,

  //
  advanceNextTrial: function () {
    if (Game.inTraining) {
      //            console.log("black")
      //          console.log("In Advance Next Trial");
      Game.trialByClick = true;
      Game.lastCheckJudgeEntity = Game.nextCheckJudgeEntity;
      Game.nextCheckJudgeEntity = Game.mainTick + 1
      Game.inFeedbackTraining = false;
      Game._timerIntervalTraining = -1;
    }
  }
  ,

  drawMultiSelectBox: function () {

    answers = Game.categoriesByCondition.map(x => Category.getUILabel(x))

    //            console.log("MULTI " + Game.conditionExperiment)
    myNode = document.getElementById('panel_Info');
    myNode.innerText = '';
    myNode.innerHTML = ' Select the category <br/>';
    answers.forEach(function (chara, N) {

      var node = document.createElement("BUTTON");
      node.innerHTML = chara;
      node.style.color = 'white';
      node.style.backgroundColor = '#499ffe';
      node.style.borderColor = '#6a7ffe';
      node.style.font = 'Verdana';
      node.style.fontSize = '16px'
      node.style.width = '200px'
      node.style.heigth = '30px'
      node.style.marginLeft = '20px'
      node.style.marginTop = '40px'

      $('div.panel_Info').append(node);
      node.onclick = function () {
        // alert("Opcion elegida " + chara)
        //Selection execute
        Game.trainingButton(chara, Game.categoriesByCondition[N]);
      };

    });

  },

  animation: function () {
    Game.animation.loop = function () {
      //Process due commands for current frame before drawing
      var commands = Game.commands[Game.mainTick];
      if (commands instanceof Array) {
        for (var N = 0; N < commands.length; N++) {
          //console.log("ejecutando "  + commands[N]);
          commands[N]();
        }
        delete Game.commands[Game.mainTick];
      }
      /************ Draw part *************/
      //Clear all canvas
      Game.cxt.clearRect(0, 0, Game.HBOUND, Game.VBOUND);
      Game.frontCxt.clearRect(0, 0, Game.HBOUND, Game.VBOUND);
      //console.log( " pintando %f , %f " , Game.HBOUND, Game.VBOUND)

      //DrawLayer0: Refresh map if needed
      if (mouseController.mouseX < Map.triggerMargin) Map.needRefresh = "LEFT";

      if (mouseController.mouseX > (Game.HBOUND - Map.triggerMargin)) Map.needRefresh = "RIGHT";
      if (mouseController.mouseY < Map.triggerMargin) Map.needRefresh = "TOP";
      if (mouseController.mouseY > (Game.VBOUND - Map.triggerMargin)) Map.needRefresh = "BOTTOM";
      if (Map.needRefresh) {
        Map.refresh(Map.needRefresh);
        Map.needRefresh = false;
      }

      //DrawLayer2: Show all existed units
      for (var N = 0; N < Unit.allUnits.length; N++) {
        var chara = Unit.allUnits[N];
        //Draw
        if (chara.visible) {
          //                        console.log("entidad invisible " + chara.id)
          Game.draw(chara);
        }
      }

      //DrawLayer5: Draw drag rect
      if (mouseController.drag) {
        Game.cxt.lineWidth = 5;
        Game.cxt.strokeStyle = "orange";

        Game.cxt.strokeRect(mouseController.startPoint.x, mouseController.startPoint.y,
          mouseController.endPoint.x - mouseController.startPoint.x,
          mouseController.endPoint.y - mouseController.startPoint.y);
        }

        Game.drawSourceBox();

        if (Game.inGame) {
          Game.mainTick++;
          if (Game.mainTick % Game._fps == 0) {//cada segundo
            Game.updateClock();
          }
        }

        if (!Game.inTraining) {
          Unit.allUnits.forEach(function (chara) {
            //Add this makes chara intelligent for attack
            if (chara.AI) {

              if (chara.name === 'entity') {
                chara.AI();
              }
            }

            //Judge reach destination
            if (chara instanceof Unit) Referee.judgeReachDestination(chara);

            chara.playFrames();
          });
        }
        //Taks to update the world to make some judgments
        Referee.tasks.forEach(function (task) {
          //console.log(task)
          Referee[task]();
        });

      };

      Game.startAnimation();
    },

  win: function () {
    this.leaveEarly = true
    Game.stop(Unit.allUnits)
    Game.saveReplayIntoDB(true)
  },

  lose: function () {
    Game.stop(Unit.allUnits);
    console.log('%c LOSv2E Page mode tutorial! ', 'background: #222222; color: #33ffda')
    Game.saveReplayIntoDB(false)
  },

  showWarning: function (msg, interval) {
    //Default interval
    if (!interval) interval = 10000;
    //Show message for a period
    $('div.warning_Box').html(msg).show();
    //Hide message after a period
    setTimeout(function () {
      $('div.warning_Box').html('').hide();
    }, interval);
  },

    showMessage: function () {
      //Clossure timer
      var _timer = 0;
      return function (msg, correct, interval) {
      };
    }(),

    showSmith: function (turn) {
      if (Game.inTraining) {
        $('div.smith_Box').html("<p>Smith's Turn</p>").hide();
      } else {

        Game.smithsTurn = turn;
        //            console.log("SHOW SMITH FUCNTION TURNO SMITH " , Game.smithsTurn);
        if (Game.smithsTurn) {
          $('div.smith_Box').html("Smith's Turn").show();
          $('div.smith_Box').css('background', '#333399');
        } else {
          $('div.smith_Box').html('Your Turn').show();
          $('div.smith_Box').css('background', '#33bb77');
        }
      }

      // console.log("Show Smith corriendo " + turn)
    }
    ,
    //Return from 0 to 0.99
    getNextRandom: (function () {
      //Clossure variable and function
      var rands = [];
      var getRands = function () {
        //Use current tick as seed
        var seed = Game.mainTick + Game.randomSeed;
        var rands = [];
        for (var N = 0; N < 100; N++) {
          //Seed grows up in range 100
          seed = (seed * 21 + 3) % 100;
          rands.push(seed);
        }
        return rands;
      };
      return function () {
        //If all rands used, generate new ones
        if (rands.length == 0) rands = getRands();
        return rands.shift() / 100;
      };
    })(),
    resizeWindow: function () {
      //Update parameters
      Game.infoBox.width = 4;
      Game.infoBox.y = 4;

      //Resize canvas
      $('#GamePlay>canvas').attr('width', Game.HBOUND);//Canvas width adjust
      //$('#GamePlay>canvas').attr('height', Game.VBOUND - Game.infoBox.height + 5);//Canvas height adjust
      $('#GamePlay>canvas').attr('height', Game.VBOUND);//Canvas height adjust
      //Resize panel_Info
      $('div.panel_Info')[0].style.width = ('800px');
      $('div.panel_Info')[0].style.height = ('200px');

      if (Map.ready) {
        //Update map inside-stroke size
        Map.insideStroke.width = (130 * Game.HBOUND / Map.getCurrentMap().width) >> 0;
        Map.insideStroke.height = (130 * Game.VBOUND / Map.getCurrentMap().height) >> 0;
        //Redraw background
        Map.drawBg();
        //Need re-calculate fog immediately


        Map.drawFogAndMinimap();
      }
    },
    getCurrentTs: function () {
      var now = new Date();
      return now;
    },


    //AJAX Calls
    reload:

    function () {
      console.log("reloading");
      /* TO DO */
    }
    ,
    createParticipant: function () {
      //            console.log("Participant in condition " + Game.conditionExperiment + " prolific id" + Game.prolificID + " session id " + Game.sessionID);
      $.ajax({
        type: "POST",
        url: 'php/createparticipant.php',
        data: {
          conditionExp: Game.conditionExperiment,
          prolific_id: Game.prolificID,
          session_id: Game.sessionID,
          condition_exp: Game.conditionExperiment,
          colours: JSON.stringify(Game.mapping),
          category_colours: JSON.stringify(Game.colourDescription),
          trialsShortVersion: JSON.stringify(Game.trialPath1),
          trialsLongVersion: JSON.stringify(Game.trialPath2),
        },
        success: function (data) {

          console.log('%c id Participant: ' + data, 'background: #222; color: #bada55');
          var obj = jQuery.parseJSON(data);
          Game.idParticipant = parseInt(obj);

        },
        error: function (xhr, ajaxOptions, thrownError) {

          console.log(" %c Error in create participate function " + xhr.status + "  Thrown Error " + thrownError, 'background: #aaaacc; color: ff0000')
        }
      });
    }
    ,
    finish: function () {
      console.log('%c Starting Finish session! ', 'background: #aaaacc; color: 99ffdd');
      console.log("Entrando a finish, llamnado ajax ph experimentCompleted")
      $.ajax({
        type: "POST",
        url: 'php/experimentCompleted.php',
        data: {id_participant: Game.idParticipant, conditionexp: Game.conditionExperiment},
        success: function (data2) {

          var obj = jQuery.parseJSON(data2);
          // window.location.reload()//aqui va regreso a Prolific
          console.log(" %c Returning to prolific " + Game.idParticipant + " " + Game.conditionExperiment, 'background: #aaaacc; color: 99ffdd')

          //alert("aqui mando a completar el estudio, sello la bd y ya" + Game.idParticipant + " " + Game.conditionExperiment );
          alert("Experiment completed. Going back to Prolific")
          console.log('%c Starting Performance session! ', 'background: #aaaacc; color: 99ffdd');
          //important, we need to use the cc provided by Prolific

          window.location.href = 'https://app.prolific.co/submissions/complete?cc=71F139EE';//HOOK
          // window.location.href = 'https://';//HOOK
        },
        error: function (xhr, ajaxOptions, thrownError) {


          console.log(" %c Error in finish function " + xhr.status + "  Thrown Error " + thrownError, 'background: #aaaacc; color: ff0000')
          alert(xhr.status);
          alert(thrownError);
        }
      });


    }
    ,
    makeFakeID: function (length) {
      var result = '';
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var numbers = '0123456789';

      var charactersLength = characters.length;
      for (var i = 0; i < 3; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      for (var j = 3; j < length; j++) {
        result += numbers.charAt(Math.floor(Math.random() * 10));
      }
      //    console.log("fake id " + result )

      return result;
    }
    ,
    randomIntFromInterval: function (min, max) { // min and max included
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    ,
    setRandomPosition: function () {

      //console.log("set randsom Position")
      Unit.allUnits.forEach(function (chara) {
        chara.setRandomPosition();
      });
    },

  getMapping: function () {
    // n categories mapped to m colours
    if (Game.conditionExperiment === 1 || Game.conditionExperiment === 4) { // control_green
      Game.mapping['' + Category.UNKNOWN] = Colour.GRAY
      Game.mapping['' + Category.FRIEND] = Colour.GREEN
      Game.mapping['' + Category.HOSTILE] = Colour.RED
      Game.mapping['' + Category.NEUTRAL] = Colour.BLUE
      Game.mapping ['' + Category.ASSUMED_FRIEND] = Colour.GREEN
      Game.mapping ['' + Category.ASSUMED_HOSTILE] = Colour.RED
    } else if (Game.conditionExperiment === 2 || Game.conditionExperiment === 5) { // categorical_green
      colorsControl = [Colour.YELLOW, Colour.PURPLE]
      Game.mapping['' + Category.UNKNOWN] = Colour.GRAY
      Game.mapping['' + Category.FRIEND] = Colour.GREEN
      Game.mapping['' + Category.HOSTILE] = Colour.RED
      Game.mapping['' + Category.NEUTRAL] = Colour.BLUE

      coloursCopy = colorsControl.map((x) => x)
      coloursCopy = Game.shuffleArray(coloursCopy)
      Game.mapping ['' + Category.ASSUMED_FRIEND] = coloursCopy[0]
      Game.mapping ['' + Category.ASSUMED_HOSTILE] = coloursCopy[1]
    } else if (Game.conditionExperiment === 3 || Game.conditionExperiment === 6) { // pictorial_green
      Game.mapping['' + Category.UNKNOWN] = Colour.GRAY
      Game.mapping['' + Category.FRIEND] = Colour.GREEN
      Game.mapping['' + Category.HOSTILE] = Colour.RED
      Game.mapping['' + Category.NEUTRAL] = Colour.BLUE
      Game.mapping['' + Category.ASSUMED_FRIEND] = Colour.C_GREEN
      Game.mapping['' + Category.ASSUMED_HOSTILE] = Colour.C_RED
    }

    for (var key in Game.mapping) {
      if (Game.mapping.hasOwnProperty(key)) {
        console.log(key, Game.mapping[key]);
        Game.colourDescription[Category.getLabel(key)] = Colour.getLabel(Game.mapping[key])
      }
    }

    console.log(Game.colourDescription);
  },

    updateTrialTrainingLogicClickDelay: function () {
      //            console.log(" *************************  *******************************  Update Trial By CLick Delay");
      //Game.trialByClick = false;

      if (Game.inTraining) {
        Game.nextCheckJudgeEntity = Game.mainTick + 250;
        Game.changeEntity();
      } else {

        //                console.log("YA MOSTRE A SMITH in practice or performance ")
        Game.intervalTrialSmith();
      }
    }
    ,
    updateTrialTrainingController: function () {
      //console.log("Update Trial By TIme Training");
      Game.trialByClick = false;
      Game.trialEndTime = Game.getCurrentTs().getTime();
      Game.endingTick = Game.mainTick;


      Game.nextCheckJudgeEntity = Game.mainTick + 250;

      if (!Game.firstTrial) {
        console.log(" %c TIMED OUT ", 'background: #ff0000')
        Game.updateTrainingStreak("Timed Out, PLEASE RESPOND FASTER", false);

        if (Game.trainingTrial > 0)
        Game.trialTrainingResult["" + Game.trainingTrial] = false

        //new
        currenttrial = {
          type: 'completeTrial',
          category_learning_trial: Game.trainingTrial,
          condition_experiment: Game.conditionExperiment,
          tick: Game.mainTick,
          completed_by: "TIMEOUT",
          participant_id: Game.idParticipant,
          starting_time_trial: Game.trialInitialTime,
          starting_tick: Game.startingTick,
          ending_tick: Game.mainTick,
          finishing_time_trial: "N/A",
          reaction_time: "N/A",
          reaction_tick: "N/A",
          category: Category.getLabel(Game.currentCategory),
          category_id: Game.currentCategory,
          category_selected: "N/A",
          category_selected_id: "N/A",
          correct: false
        }
        Game.storeData({'complete_category_learning_trial': currenttrial}, true, true)

      }

      Game.firstTrial = false;
      Game.changeEntity();

    },

    updateTrialTrainingLogic: function () {

      Game.trialByClick = true;//
      Game.trialEndTime = Game.getCurrentTs().getTime();
      Game.endingTick = Game.mainTick;


      if (Game.inTraining) {
        Game.updateTrialTrainingController()
      } else {
        if (!Game.firstTrial) {
          console.log(" %c TIMED OUT ", 'background: #ff0000')
          Game.updateTrainingStreak("Timed Out, PLEASE RESPOND FASTER", false);
          if (Game.inPractice) {
            Game.trialPracticeResult["" + Game.practiceTrial] = false
          }
          if (Game.inPerformance) {
            Game.trialPerformanceResult["" + Game.performanceTrial] = false
          }


          currentEntityChanged = Participation.getUnitByID(Game.idCurrentEntityChanged)
          if (!currentEntityChanged) {
            console.log("Entidad nula*******************")
            currentEntityChanged = {x: "NA", y: "NA"}
          }
          if (Game.inPractice) {

            currenttrial = {
              type: 'complete_practice_trial',
              practice_trial: Game.practiceTrial,
              condition_experiment: Game.conditionExperiment,
              tick: Game.mainTick,
              completed_by: "TIMEOUT_practice",
              participant_id: Game.idParticipant,
              starting_time_trial: Game.trialInitialTime,
              starting_tick: Game.startingTick,
              ending_tick: Game.mainTick,
              finishing_time_trial: "N/A",
              reaction_time: "N/A",
              reaction_tick: "N/A",
              iti_trial: Game.currentITI,
              previous_category_id: Game.previousCategory,
              previous_category: Category.getLabel(Game.previousCategory),
              selected_id: "N/A",
              current_position_entity_selected: "N/A",
              selected_entity_category_id: "N/A",
              selected_entity_category: "N/A",
              changed_entity_id: Game.idCurrentEntityChanged,
              changed_entity_category_id: Game.currentCategory,
              changed_entity_category: Category.getLabel(Game.currentCategory),
              current_position_entity_changed: {x: currentEntityChanged.x, y: currentEntityChanged.y},
              entities_by_category: Game.getEntitiesByCategoryCurrentTrial(),
              correct: false,


            }

            Game.storeData({'complete_practice_trial': currenttrial}, true, true)

          } else if (Game.inPerformance) {


            currenttrial = {

              type: 'complete_monitoring_trial',
              participant_id: Game.idParticipant,
              starting_time_trial: Game.trialInitialTime,
              finishing_time_trial: "N/A",
              reaction_time: "N/A",
              starting_tick: Game.startingTick,
              ending_tick: Game.endingTick,
              reaction_tick: "N/A",
              trial_no_change: Game.isTrialNoChange,
              trial_description: Game.trial_description,
              iti_trial: Game.currentITI,
              monitoring_trial: Game.performanceTrial,
              completed_by: "TIMEOUT_monitoring",
              condition_experiment: Game.conditionExperiment,
              tick: Game.mainTick,
              previous_category_id: Game.previousCategory,
              previous_category: Category.getLabel(Game.previousCategory),
              selected_entity_id: "N/A",
              current_position_entity_selected: "N/A",// {x: currentEntity.x, y: currentEntity.y},
              selected_entity_category_id: "N/A",
              selected_entity_category: "N/A",
              changed_entity_id: Game.idCurrentEntityChanged,
              changed_entity_category_id: Game.currentCategory,
              changed_entity_category: Category.getLabel(Game.currentCategory),
              current_position_entity_changed: {x: currentEntityChanged.x, y: currentEntityChanged.y},
              entities_by_category: Game.getEntitiesByCategoryCurrentTrial(),
              correct: false
            }

            Game.storeData({'complete_monitoring_trial': currenttrial}, true, true)
          }
        }
        Participation.cmds = [];
        Game.intervalTrialSmith();
      }
    }
    ,
    updateTrialClick: function (entity) {
      if (Game.trialByClick) {
        console.log("trialByClcil atorado **********************************")
        return
      }
      Game.trialByClick = true;
      //to avoid timed out
      Game.nextCheckJudgeEntity = Game.mainTick + 250;

      if (Game.selectedUnit) {
        var _trial;
        if (Game.idCurrentEntityChanged == Game.selectedUnit.id) {


          console.log(" %c CORRECT ", 'background: #00ff00')
          Game.updateTrainingStreak("Correct Entity Detected ", true);
          var correct;
          if (Game.inTraining) {
            Game.trialTrainingResult["" + Game.trainingTrial] = true
            correct = true;
            //    _trial = Game.trainingTrial;
          }
          if (Game.inPractice) {
            Game.trialPracticeResult["" + Game.practiceTrial] = true
            correct = true;
            //_trial = Game.practiceTrial;
          }
          if (Game.inPerformance) {
            Game.trialPerformanceResult["" + Game.performanceTrial] = true
            correct = true;
            //_trial = Game.performanceTrial;
          }

        } else {
          console.log(" %c WRONG ", 'background: #ff0000')
          Game.updateTrainingStreak("Wrong Entity Detected ", false);
          if (Game.inTraining) {
            Game.trialTrainingResult["" + Game.trainingTrial] = false;
            correct = false;
            //_trial = Game.trainingTrial;
          }
          if (Game.inPractice) {
            Game.trialPracticeResult["" + Game.practiceTrial] = false
            correct = false;
            //_trial = Game.practiceTrial;
          }
          if (Game.inPerformance) {
            Game.trialPerformanceResult["" + Game.performanceTrial] = false
            correct = false;

            //_trial = Game.performanceTrial;
          }
        }
        currentEntitySelected = Participation.getUnitByID(Game.selectedUnit.id)
        currentEntityChanged = Participation.getUnitByID(Game.idCurrentEntityChanged)
        if (!currentEntityChanged) {
          console.log("Entidad nula*******************")
          currentEntityChanged = {x: "NA", y: "NA"}
        }
        Participation.cmds = [];
        if (Game.inPractice) {


          //new

          reaction_time_calc = Game.trialEndTime - Game.trialInitialTime;
          //     console.log(" %c  REACTION_TIME ANTES%i ", 'background: #ddddff', reaction_time_calc)
          if (reaction_time_calc > 5000) {
            reaction_time_calc = reaction_time_calc % 5000
          } //because people swithces tabs
          //   console.log(" %c  REACTION_TIME DESPUES%i ", 'background: #ddddff', reaction_time_calc)



          currenttrial = {
            type: 'complete_practice_trial',
            practice_trial: Game.practiceTrial,
            condition_experiment: Game.conditionExperiment,
            tick: Game.mainTick,
            completed_by: "CLICKED_practice",
            participant_id: Game.idParticipant,
            starting_time_trial: Game.trialInitialTime,
            finishing_time_trial: Game.trialEndTime.getTime(),
            starting_tick: Game.startingTick,
            ending_tick: Game.endingTick,
            reaction_time: reaction_time_calc,
            reaction_tick: Game.endingTick - Game.startingTick,
            iti_trial: Game.currentITI,
            previous_category_id: Game.previousCategory,
            previous_category: Category.getLabel(Game.previousCategory),
            selected_id: currentEntitySelected.id,
            current_position_entity_selected: {x: currentEntitySelected.x, y: currentEntitySelected.y},
            selected_entity_category_id: currentEntitySelected.category,
            selected_entity_category: Category.getLabel(currentEntitySelected.category),
            changed_entity_id: Game.idCurrentEntityChanged,
            changed_entity_category_id: Game.currentCategory,
            changed_entity_category: Category.getLabel(Game.currentCategory),
            current_position_entity_changed: {x: currentEntityChanged.x, y: currentEntityChanged.y},
            entities_by_category: Game.getEntitiesByCategoryCurrentTrial(),
            correct: correct
          }
          Game.storeData({'complete_practice_trial': currenttrial}, true, true)

        } else if (Game.inPerformance) {


          //new
          reaction_time_calc = Game.trialEndTime - Game.trialInitialTime

          //     console.log(" %c  REACTION_TIME ANTES%i ", 'background: #ddddff', reaction_time_calc)
          if (reaction_time_calc > 5000) {
            reaction_time_calc = reaction_time_calc % 5000 //because people swithces tabs
            //     console.log(" %c  REACTION_TIME DESPUES %i ", 'background: #ddddff', reaction_time_calc)
          }


          currenttrial = {
            type: 'complete_monitoring_trial',
            monitoring_trial: Game.performanceTrial,
            condition_experiment: Game.conditionExperiment,
            tick: Game.mainTick,
            completed_by: "CLICKED_monitoring",
            participant_id: Game.idParticipant,
            starting_time_trial: Game.trialInitialTime,
            finishing_time_trial: Game.trialEndTime.getTime(),
            starting_tick: Game.startingTick,
            ending_tick: Game.endingTick,
            reaction_tick: Game.endingTick - Game.startingTick,
            trial_no_change: Game.isTrialNoChange,
            trial_description: Game.trial_description,
            reaction_time: reaction_time_calc,
            iti_trial: Game.currentITI,
            previous_category_id: Game.previousCategory,
            previous_category: Category.getLabel(Game.previousCategory),
            current_position_entity_selected: {x: currentEntitySelected.x, y: currentEntitySelected.y},
            selected_entity_id: currentEntitySelected.id,
            selected_entity_category_id: currentEntitySelected.category,
            selected_entity_category: Category.getLabel(currentEntitySelected.category),
            changed_entity_id: Game.idCurrentEntityChanged,
            changed_entity_category_id: Game.currentCategory,
            changed_entity_category: Category.getLabel(Game.currentCategory),
            current_position_entity_changed: {x: currentEntityChanged.x, y: currentEntityChanged.y},
            entities_by_category: Game.getEntitiesByCategoryCurrentTrial(),
            correct: correct
          }

          Game.storeData({"complete_monitoring_trial": currenttrial}, true, true)
        }
        Participation.cmds = [];

        Game.intervalTrialSmith();
      }
    }
    ,
    getTrainingCategoryNextTrial: function () {
      Game.trainingTrial;
      Game.categoriesByCondition;
      if (Game.categoriesRemaining.length == 0) {
        Game.categoriesRemaining = JSON.parse(JSON.stringify(Game.categoriesByCondition));
        Game.categoriesRemaining = Game.shuffleArray(Game.categoriesRemaining)
      }
      var cat = Game.categoriesRemaining.pop();
      return cat;
    }

    ,
    changeCategoryLearning: function () {

      //idToChange = Game.trainingTrial % Unit.allUnits.length
      //now I get the new category
      idNextCategory = Game.getTrainingCategoryNextTrial();
      Game.drawMultiSelectBox();

      Game.trainingTrial++;
      if (Game.checkMaxTrial()) {
        console.log(" Alcanzado el numero de trials por tipo de sesion")
        return true;
      }

      Game.trialInitialTime = Game.getCurrentTs().getTime();
      Game.startingTick = Game.mainTick;


      Game.previousCategory = Game.currentCategory;
      Game.currentCategory = idNextCategory;
      //        console.log("categoria a cambiar %d %s", Game.currentCategory, Category.getLabel(Game.currentCategory));
      color = Game.mapping['' + Game.currentCategory]
      Game.idCurrentEntityChanged = 0;
      Unit.allUnits.forEach(function (chara) {

        if (chara.id == 0) { //we only have one entity
          //console.log("ID a cambiar encotnrado");
          unitToChange = chara;
          unitToChange.category = Game.currentCategory;
        }
      });


      Participation.cmds = [];
      Game.resetEntitiesByCategory();
      Game.trialByClick = false;
      Game.showSmith(false);
    }
    ,
    getIndexPosition: function (category) {

      for (i = 0; i < Game.categoriesByCondition.length; i++) {
        cat = Game.categoriesByCondition[i]
        if (cat === category) {
          return i;
        }
      }
      console.log("ERROR en get INDEX POSTITION")
      return -1;

    }
    ,
    changeEntityPractice: function () {

      //  console.log(" entrando a changeEntityPractice ")
      var idToChange;
      Game.nextCheckJudgeEntity = Game.mainTick + 250;
      idToChange = Game.practiceTrial;
      var unitToChange;
      var prevUnit;
      Unit.allUnits.forEach(function (chara) {

        if (chara.id == idToChange) {
          unitToChange = chara;
        }

      });
      if (unitToChange) {
        // console.log("TRIAL ", Game.practiceTrial)
        if (Game.checkMaxTrial()) {
          console.log(" Alcanzado el numero de trials por tipo de sesion")
          return true;
        }


        Game.trialInitialTime = Game.getCurrentTs().getTime();

        Game.startingTick = Game.mainTick;

        currentcat = Game.getIndexPosition(unitToChange.category)
        randomIndex = (currentcat + 1) % Game.categoriesByCondition.length;

        Game.categoryIndex = randomIndex;
        //Game.categoryIndex = Game.trainingTrial;
        Game.previousCategory = unitToChange.category;
        unitToChange.category = Game.categoriesByCondition[Game.categoryIndex]; //control
        Game.currentCategory = unitToChange.category;
        unitToChange.colour = Game.mapping['' + unitToChange.category]
        Game.idCurrentEntityChanged = unitToChange.id;

        console.log(" paso de  %s a  %s", Category.getLabel(Game.previousCategory), Category.getLabel(Game.currentCategory))
        Participation.cmds = [];
        Game.resetEntitiesByCategory();
        Game.trialByClick = false;

      }
    },

    changeEntityPerformance: function () {
      Game.trialByClick = false;
      console.log(" TRIAL  %d ", Game.performanceTrial);
      if (Game.checkMaxTrial()) {
        console.log(" Alcanzado el numero de trials por monitoring")
        return true;
      }
      catFromTo = "";

      if (Game.performanceFirstRound && Game.performanceSecondRound && Game.performanceThirdRound) {
        catFromTo = Game.trialPath3[Game.performanceTrial].split("|")
        console.log(Game.trialPath3[Game.performanceTrial])
      } else if (Game.performanceFirstRound && Game.performanceSecondRound && !Game.performanceThirdRound) {
        catFromTo = Game.trialPath2[Game.performanceTrial].split("|")
        console.log(Game.trialPath2[Game.performanceTrial])
      } else if (Game.performanceFirstRound && !Game.performanceSecondRound && !Game.performanceThirdRound) {
        console.log(Game.trialPath1[Game.performanceTrial])
        catFromTo = Game.trialPath1[Game.performanceTrial].split("|")
      }

      Game.trial_description = catFromTo;


      if (catFromTo[0] === "0") { //case no change intended
        console.log("NO CHANGE")
        Game.nextCheckJudgeEntity = Game.mainTick + 250;
        Game.isTrialNoChange = true;
        Participation.cmds = [];
        Game.resetEntitiesByCategory();
        Game.trialInitialTime = Game.getCurrentTs().getTime();
        Game.startingTick = Game.mainTick;
        Game.currentITI = 0; // check
        Game.trialByClick = false;

        return;
      }

      if (catFromTo[0] === catFromTo[1]) { //case the path is simplified
        console.log("*********NO CHANGE because same category")
        Game.nextCheckJudgeEntity = Game.mainTick + 250;
        Game.isTrialNoChange = true;
        Participation.cmds = [];
        Game.resetEntitiesByCategory();
        Game.trialInitialTime = Game.getCurrentTs().getTime();
        Game.startingTick = Game.mainTick;
        Game.currentITI = 0; // check
        Game.trialByClick = false;

        return;
      }

      console.log(" Cat %s : %s to  %s :  %s", catFromTo[0], Category.getLabel(catFromTo[0]), catFromTo[1], Category.getLabel(catFromTo[1]),)
      var unitToChange = undefined;
      Unit.allUnits.forEach(function (chara) {
        if (chara.category === catFromTo[0] && !unitToChange) {
          unitToChange = chara;
          unitToChange.category = catFromTo[1];
          Game.idCurrentEntityChanged = unitToChange.id;
          unitToChange.colour = Game.mapping['' + unitToChange.category]
        }

      });
      if (Game.checkMaxTrial()) return;
      Game.trialInitialTime = Game.getCurrentTs().getTime();
      Game.startingTick = Game.mainTick;


      var copyEntities = Game.descriptionEntities();
      copy = JSON.parse(JSON.stringify(copyEntities))


      Game.previousCategory = catFromTo[0];
      Game.currentCategory = catFromTo[1];
      Game.isTrialNoChange = false;
      Participation.cmds = [];
      Game.resetEntitiesByCategory();
      Game.trialByClick = false;

      Game.nextCheckJudgeEntity = Game.mainTick + 250;
      //        console.log("Showing smith Change entity performance")
      Game.showSmith(false);
    }
    ,
    intervalTrialSmith: function () {
      //         console.log("Interval Smith Showing************** ");

      Game.showSmith(true);
      if (Game.isTrialNoChange) {
        // Game.isTrialNoChange = false;
        //          console.log("Change NO TRIAL VALUE")
      }
      if (!Game.firstTrial) {
        if (Game.inPractice) {
          Game.practiceTrial++
        } else if (Game.inPerformance) {
          Game.performanceTrial++
        }
        setTimeout(Game.startTrial, Game.smithShowUpTime);//ITI
        //              console.log("ITI NORMAL")
      } else {
        setTimeout(Game.startTrial, Game.smithShowUpTime);//ITI
        //                console.log("ITI CORTO")
      }
    }
    ,
    startTrial: function () {

      if (Game.inPractice) {
        // Game.practiceTrial++;
        if (!Game.checkMaxTrial()) {
          Participation.cmds = [];
        }
      } else if (Game.inPerformance) {
        //GametrialGame.performanceTrial++;
        if (!Game.checkMaxTrial()) {
          Participation.cmds = [];
        }
      }

      Game.showSmith(false);
      variableStartingTime = Game.randomIntFromInterval(Game.ITIMinStartTime, Game.ITIMaxStartTime)
      Game.currentITI = variableStartingTime;
      //Game.trialByClick = false;//to click as soon as it is green.   <-----
      setTimeout(Game.changeEntity, variableStartingTime);//ITI
      if (Game.firstTrial) {
        //console.log("FUE FIRST TRIAL")
        Game.firstTrial = false;
      }

    }
    ,
    changeEntity: function () {

      Game.freeze = false;//maybe to click before
      Game.unselectAll();
      if (Game.inTraining) {
        Game.changeCategoryLearning();
      } else if (Game.inPractice) {
        if (Game.smithsTurn) {
          console.log("Error Smiths turn no debo cambiar en este periodo");
        } else {
          Game.changeEntityPractice();
        }
      } else if (Game.inPerformance) {
        if (Game.smithsTurn) {
          console.log("Error Smiths turn no debo cambiar en este periodo");
        } else {
          Game.changeEntityPerformance();
        }
      }
    }
    ,
    getCurrentTrial: function () {
      _trial = -1;
      if (Game.inTraining) {
        _trial = Game.trainingTrial;
      } else if (Game.inPractice) {
        _trial = Game.practiceTrial;
      } else if (Game.inPerformance) {
        _trial = Game.performanceTrial;
      }
      return _trial;

    }
    ,
    checkMaxTrial: function () {
      if (Game.inTraining) {
        if (Game.trainingTrial >= Game.maxTrainingTrials)
        return true;
      } else if (Game.inPractice) {

        if (Game.practiceTrial >= Game.maxPracticeTrial)
        return true
      } else if (Game.inPerformance) {
        if (Game.performanceTrial >= Game.maxPerformanceTrial)
        return true
      }
      return false;
    }
    ,
    updateTrainingStreak: function (msg, correct) {
      if (Game.inTraining) {
        if (correct) {
          Game.showMessage(msg, true)
          //  if (Game.trainingTrial > 0)
          Game.trainingStreak += "r";
        } else {
          Game.showMessage(msg, false)
          //    console.log(" Wrong trial")
          //     if (Game.trainingTrial > 0)
          Game.trainingStreak += "w";
        }
      } else if (Game.inPractice) {
        if (correct) {

          Game.showMessage(msg, true)
          //if (Game.practiceTrial > 0)
          Game.practiceStreak += "r";
        } else {
          Game.showMessage(msg, false)
          // if (Game.practiceTrial > 0)
          Game.practiceStreak += "w";
        }
      } else if (Game.inPerformance) {
        if (correct) {
          Game.showMessage(msg, true)
          // if (Game.performanceTrial > 0)
          Game.performanceStreak += "r";
        } else {
          Game.showMessage(msg, false)
          //    console.log(" Wrong trial")
          // if (Game.performanceTrial > 0)
          Game.performanceStreak += "w";
        }
      }
    },

  createEntitiesRatio: function () {
    table = {}
    table = TrialsRatio.entitiesRatio

    /*        console.log(" %c Units Before %d ", 'background: #ffbb00' , Unit.allUnits.length )  */
    for (var key in table) {
      if (table.hasOwnProperty(key)) {
        //              console.log(key, table[key]);
        for (i = 0; i < table[key]; i++) {
          e1 = new Entity({
            x: 400 + Game.randomIntFromInterval(-380, 380),
            y: 400 + Game.randomIntFromInterval(-380, 380)
          });

          e1.fakeid = Game.makeFakeID(7);
          e1.category = key;
          Unit.allUnits.push(e1);
        }
      }
    }
    console.log(" %c Units After %d ", 'background: #ffbb00', Unit.allUnits.length)
  },

    /**Between practice and Monitoring*/
    updateEntities: function () {
      /*
      if (Game.performanceFirstRound && Game.performanceSecondRound && Game.inPerformance) {
      console.log("updateEntities first")
      Game.createEntitiesRatio();
    } else {
    if (Game.inPractice) {
    numStimuli = Game.numStimuliTraining; //4 at this moment
    //                    console.log(" Practice creando %d cosas ", numStimuli)
    typeEntities = Game.categoriesByCondition.length;

    for (i = 0; i < numStimuli; i++) {
    e1 = new Entity({
    x: 400 + Game.randomIntFromInterval(-400, 400),
    y: 400 + Game.randomIntFromInterval(-400, 400)
  });
  e1.fakeid = Game.makeFakeID(7);
  e1.category = Game.categoriesByCondition[i % typeEntities];
  Unit.allUnits.push(e1);
}
} else if (Game.inPerformance) {
Game.createEntitiesRatio();
}
}*/


if (Game.inPractice) {
  numStimuli = Game.numStimuliTraining; //4 at this moment
  //                    console.log(" Practice creando %d cosas ", numStimuli)
  typeEntities = Game.categoriesByCondition.length;

  for (i = 0; i < numStimuli; i++) {
    e1 = new Entity({
      x: 400 + Game.randomIntFromInterval(-400, 400),
      y: 400 + Game.randomIntFromInterval(-400, 400)
    });
    e1.fakeid = Game.makeFakeID(7);
    e1.category = Game.categoriesByCondition[i % typeEntities];
    Unit.allUnits.push(e1);
  }
} else if (Game.inPerformance) {
  Game.createEntitiesRatio();
}
},

  shuffleArray: function (array) {
    //            console.log("original " + array)
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var temp = array[i]
      array[i] = array[j]
      array[j] = temp;
    }
    //          console.log("shuffled " + array)
    return array
  },

descriptionEntities: function () {

  //            console.log("categorias actuales " + JSON.stringify(Game.entitiesByCategory))
  Unit.allUnits.forEach(function (entity) {

    key = Category.getLabel(entity.category)
    //            console.log("categorya a buyscar "  +  key )
    if (Game.entitiesByCategory[key] != undefined) {
      //      console.log( "clave categoria encontrada, sumar 1   %s", entity.category)
      Game.entitiesByCategory[key] = Game.entitiesByCategory[key] + 1;
    } else {
      //    console.log( "clave no encontrada seguir en 0  : %s %s", entity.category , key )
      Game.entitiesByCategory[key] = 0
    }
  })

  return Game.entitiesByCategory;
},

  /*stores with tick as key*/
  storeData: function (customInfo, reset, append) {
    Participation.cmds.push(
      customInfo
    )
    Game.replay[Game.mainTick] = $.extend([], Participation.cmds)
  },

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
                Unit.allUnits.splice(0, Unit.allUnits.length)
                Unit.currentID = 0
                Game.play()
              })
            })
            survey.render("surveyElement");
          } else {
            console.log("Saved Untrained");
            //                        console.log('%c DEBO ESTAR EN BATEAR PARTICIPANT sion! ', 'background: #aaaacc; color: 99ffdd');
            Game.layerSwitchTo("GameStart");

            var json = {
              title: "Uncertain entities",
              showProgressBar: "top",
              pages:
                [{
                  title: "Training Finished ",
                  questions:
                  [
                    {
                      type: "html",
                      name: "finishTutorial",
                      html: WebPages.htmlByeUntrained
                    }
                  ]
                }]
            }
            var survey = new Survey.Model(json)
            survey.onComplete.add(function (result) {
              console.log('%c Wrong sion! ', 'background: #aaaacc; color: 99ffdd')
              $('.sv_body.sv_completed_page').hide()
              //reseting values for second round
              $(function () {
                alert("Going back to prolific")
                window.location.href = 'https://app.prolific.ac/submissions/complete?cc=12341234';//HOOKIgual para descartar participantes
              })
            })
            survey.render("surveyElement")
          }
        },

        error: function (xhr, ajaxOptions, thrownError) {
          console.log(" %c Error in SaveReplayIntoDB function " + xhr.status + "  Thrown Error " + thrownError, 'background: #aaaacc; color: ff0000')
          alert(xhr.status)
          alert(thrownError)
        }
      })
    } else if (Game.inPractice) { // end if Game.inTraining
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
              Game.performanceFirstRound = true
              Game.performanceSecondRound = false
              Game.performanceThirdRound = false
              console.log("***********************")

              if (Game.inPerformance) {
                console.log('%c Performance sessionTRUE ', 'background: #77ffcc; color: 99ffdd');
              }
              console.log('%c Init values for Performance session! ', 'background: #aaaacc; color: 99ffdd');

              //deleting every unit
              Unit.allUnits.splice(0, Unit.allUnits.length);
              Unit.currentID = 0;
              Game.play();
            });
          });
          survey.render("surveyElement");
        }
      });
    } else if (Game.inPerformance) { // end if Game.inPractice
      Game.layerSwitchTo('GameStart')
      if (Game.performanceFirstRound && !Game.performanceSecondRound && !Game.performanceThirdRound) {
        Game.layerSwitchTo("GameStart")
        console.log("CHARLOTTE")
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
                Game.performanceThirdRound = false

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
      } else if (Game.performanceFirstRound && Game.performanceSecondRound && !Game.performanceThirdRound) {// end (Game.performanceFirstRound && !Game.performanceSecondRound && !Game.performanceThirdRound)
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
      } else if (Game.performanceFirstRound && Game.performanceSecondRound && Game.performanceThirdRound) {
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
              })
            })
            survey.render("surveyElement");
          } // end success
        }) // end ajax
      }
    } // end if Game.inPerformance
  }, // end saveReplayIntoDB

  getEntitiesByCategoryCurrentTrial: function () {
    numCategoriesByEntity = {}
    var units = Unit.allUnits
    units.forEach(function (chara) {
      category = chara.category

      if (numCategoriesByEntity[Category.getLabel(category)]) {
        //console.log("categoria encontrada +1 " + Category.getLabel(category))
        numCategoriesByEntity[Category.getLabel(category)] = numCategoriesByEntity[Category.getLabel(category)] + 1
      } else {
        numCategoriesByEntity[Category.getLabel(category)] = 1
      }
    })

    for (remainingCat = 0; remainingCat <= 8; remainingCat++) {
      if (!numCategoriesByEntity[Category.getLabel(remainingCat)]) {
        numCategoriesByEntity[Category.getLabel(remainingCat)] = 0
      }
    }
    return numCategoriesByEntity
  }
}
