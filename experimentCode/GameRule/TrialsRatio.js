var TrialsRatio = {
  proposedTrials: [],
  goodPath: [],

  trialsRatio15: [],
  trialsRatio12: [],

  entitiesRatio: {"1": 6, "2": 2, "3": 2, "4": 2, "5": 6, "6": 6},

  createTrials: function (originalCategory, newCategory, ratioa, ratiob) {
          /*  if (Game.conditionExperiment == 1) {
                if (originalCategory == 5) {
                    originalCategory = 2
                    console.log(" cambio from af to f")
                }
                //assumed friendly to friendly
                if (originalCategory == 6) {
                    originalCategory = 4 //assumed hostile to hostile
                    console.log(" cambio from ah to h")
                }
                if (newCategory == 5) {
                    newCategory = 2
                    console.log(" cambio from af to f")
                }
                //assumed friendly to friendly
                if (newCategory == 6) {
                    newCategory = 4 //assumed hostile to hostile
                    console.log(" cambio from ah to h")
                }
            }*/

    var trialAtoB = originalCategory + '|' + newCategory
    var trialBtoA = newCategory + '|' + originalCategory
    for (var i = 0; i < ratioa; i++) {
      TrialsRatio.proposedTrials.push(trialAtoB);
      console.log(" adding " + trialAtoB)
    }
    for (var j = 0; j < ratiob; j++) {
      TrialsRatio.proposedTrials.push(trialBtoA);
      console.log(" adding " + trialBtoA)
    }
    //console.log("END ROW")
  },

  init: function () {
    TrialsRatio.fillData()
  },

  initCreateMode: function () {
    if (Game.conditionExperiment === 1 || Game.conditionExperiment === 2) {
      var nUncertainTrials = 5
      var nCertainTrials = 1
    } else {
      var nUncertainTrials = 4
      var nCertainTrials = 2
    }

    // According to Table 1 in DSTL08 tech report
    TrialsRatio.createTrials('1', '2', nUncertainTrials, nCertainTrials)
    TrialsRatio.createTrials('1', '5', nUncertainTrials, nUncertainTrials)
    TrialsRatio.createTrials('1', '3', nUncertainTrials, nCertainTrials)
    TrialsRatio.createTrials('1', '6', nUncertainTrials, nUncertainTrials)
    TrialsRatio.createTrials('1', '4', nUncertainTrials, nCertainTrials)
    TrialsRatio.createTrials('3', '2', nCertainTrials, nCertainTrials)
    TrialsRatio.createTrials('3', '5', nCertainTrials, nUncertainTrials)
    TrialsRatio.createTrials('3', '6', nCertainTrials, nUncertainTrials)
    TrialsRatio.createTrials('3', '4', nCertainTrials, nCertainTrials)
    TrialsRatio.createTrials('2', '5', nCertainTrials, nUncertainTrials)
    TrialsRatio.createTrials('2', '6', nCertainTrials, nUncertainTrials)
    TrialsRatio.createTrials('2', '4', nCertainTrials, nCertainTrials)
    TrialsRatio.createTrials('5', '6', nUncertainTrials, nUncertainTrials)
    TrialsRatio.createTrials('5', '4', nUncertainTrials, nCertainTrials)
    TrialsRatio.createTrials('6', '4', nUncertainTrials, nCertainTrials)
    // TrialsRatio.createTrials("0", "0", 4, 1); // 5 no change trials
  },

  getTrialPath: function () {
    var i = 0
    do {
      console.log('Find path trial: ' + i)

      // Get random order of trials
      console.log(' Original: ' + TrialsRatio.proposedTrials)
      var tmp = Game.shuffleArray(TrialsRatio.proposedTrials)
      console.log(' Proposed: ' + tmp)

      var set1 = tmp.slice(0, (tmp.length / 3))
      var goodTrial1 = TrialsRatio.test(set1)
      if (goodTrial1) {
        TrialsRatio.goodPath1 = set1 // Add first set

        // Look for second set (but only if first search was successful)
        var set2 = tmp.slice((tmp.length / 3), 2 * (tmp.length / 3))
        var goodTrial2 = TrialsRatio.test(set2)

        if (goodTrial2) {
          TrialsRatio.goodPath2 = set2 // Add first set

          var set3 = tmp.slice(-(tmp.length / 3))
          var goodTrial3 = TrialsRatio.test(set3)

          if (goodTrial3) {
            TrialsRatio.goodPath3 = set3
            TrialsRatio.goodPath.push(...set1, ...set2, ...set3)

            console.log(' %c GOOD PATH ', 'background: #00ff00')
          }
        }
      }
      i++
      if (i >= 500) return
    }
    while (!goodTrial1 || !goodTrial2 || !goodTrial3 || i === 10) console.log('Trials attempted: ' + i)
    if (goodTrial1 & goodTrial2 & goodTrial3) {
      console.log(TrialsRatio.goodPath1)
      console.log(TrialsRatio.goodPath2)
      console.log(TrialsRatio.goodPath3)
      console.log(TrialsRatio.goodPath)
    }
  },

  test: function (tmp) {
    entitiesByCategory = {"1": 6, "2": 2, "3": 2, "4": 2, "5": 6, "6": 6}

    trials = tmp.length;
    for (entry = 0; entry < trials; entry++) {
      categories_from_to = tmp[entry].split("|")
      console.log(" %c  Entites by category before ", 'background: #33aaff')
      console.log(entitiesByCategory);
      console.log("result: " + categories_from_to)
      if (categories_from_to[0] === "0") {
        console.log("trial sin cambio");
      } else {
        if (entitiesByCategory[categories_from_to[0]]) {
          console.log(" Ir de categoria: %s cantidad actual %d a categoria %s cantidad futura %d:", categories_from_to[0], entitiesByCategory[categories_from_to[0]], categories_from_to[1], entitiesByCategory[categories_from_to[1]] + 1)
          entitiesByCategory[categories_from_to[0]] = entitiesByCategory[categories_from_to[0]] - 1
          entitiesByCategory[categories_from_to[1]] = entitiesByCategory[categories_from_to[1]] + 1
        } else {

          console.log(" %c WRONG PATH ", 'background: #ff0000')
          return false;
        }
      }

      console.log(' %c  Entites by category after ', 'background: #33aaff')
      console.log(entitiesByCategory)
    }
    return true // the trial has a path from beggining to end
  },

  fillData: function () {
    // Ratio 1:5 stimuli
    TrialsRatio.trialsRatio15.push(["1|4", "1|4", "1|5", "3|4", "5|3", "1|6", "3|2", "6|1", "5|4", "2|6", "6|3", "6|3", "1|4", "2|4", "5|4", "6|2", "1|2", "5|1", "5|6", "5|1", "5|4", "3|5", "1|6", "5|6", "1|5", "6|2", "6|5", "4|1", "2|3", "5|3", "1|3", "1|2", "5|2", "6|4", "5|1", "1|6", "6|1", "1|4", "1|6", "6|5", "6|4", "1|3", "4|6", "6|4", "1|5", "6|2", "1|3", "5|2", "3|1", "6|3", "2|5", "5|6", "5|3", "2|1", "6|5", "5|3", "1|2", "5|1", "6|1", "4|5", "5|1", "1|5", "5|2", "6|4", "5|4", "5|6", "1|3", "6|3", "1|2", "1|2", "6|1", "6|3", "6|2", "6|5", "1|3", "4|2", "5|3", "6|5", "5|2", "4|3", "1|6", "5|6", "1|4", "1|5", "5|2", "6|2", "3|6", "6|4", "6|1", "5|4"])
    TrialsRatio.trialsRatio15.push(["2|6", "6|2", "6|4", "6|2", "5|1", "6|1", "5|2", "5|3", "2|5", "3|6", "1|3", "1|4", "1|6", "3|5", "1|5", "6|5", "4|1", "1|6", "6|4", "1|5", "5|3", "5|2", "5|3", "5|4", "1|3", "1|5", "6|2", "6|1", "3|2", "5|1", "6|4", "6|1", "5|3", "4|3", "2|4", "1|4", "5|6", "1|2", "2|3", "6|3", "1|6", "5|4", "5|6", "6|4", "1|3", "5|4", "5|2", "4|5", "6|1", "1|6", "1|3", "6|5", "1|3", "2|1", "5|1", "6|2", "6|5", "5|4", "1|2", "1|2", "1|4", "1|4", "6|3", "1|2", "1|6", "6|5", "5|6", "4|6", "5|1", "5|3", "6|3", "6|3", "1|2", "1|5", "5|6", "1|4", "6|2", "5|1", "3|4", "6|5", "3|1", "5|4", "1|5", "5|6", "6|1", "6|3", "4|2", "6|4", "5|2", "5|2"])
    TrialsRatio.trialsRatio15.push(["1|4", "6|5", "5|1", "1|2", "6|2", "6|1", "1|5", "1|6", "6|3", "5|3", "2|5", "1|3", "3|2", "1|5", "6|2", "4|3", "1|3", "2|6", "6|2", "6|4", "5|6", "5|6", "5|2", "5|1", "1|3", "5|2", "6|2", "6|1", "1|2", "5|3", "4|5", "1|5", "1|3", "5|4", "6|2", "5|1", "1|6", "6|4", "1|5", "2|1", "1|6", "3|1", "6|4", "5|6", "6|3", "5|6", "1|3", "1|2", "6|4", "5|4", "6|5", "5|2", "2|4", "5|1", "6|3", "5|4", "6|4", "1|2", "5|3", "1|4", "1|4", "3|4", "1|6", "6|1", "5|4", "2|3", "3|6", "6|1", "5|3", "6|5", "1|5", "5|6", "6|3", "1|4", "5|2", "5|2", "5|3", "6|5", "1|4", "5|4", "1|2", "4|2", "5|1", "3|5", "6|1", "4|6", "6|5", "4|1", "1|6", "6|3"])
    TrialsRatio.trialsRatio15.push(["6|3", "3|4", "1|4", "2|3", "6|1", "3|5", "1|6", "1|2", "3|2", "5|4", "5|1", "5|2", "1|3", "1|6", "1|2", "6|4", "6|5", "1|5", "1|3", "4|1", "5|2", "5|1", "5|6", "5|3", "4|5", "1|3", "5|6", "5|4", "5|2", "6|2", "5|2", "6|3", "6|1", "5|1", "5|3", "6|4", "1|2", "1|6", "6|4", "1|4", "4|6", "5|6", "5|3", "5|1", "6|5", "6|2", "6|1", "4|2", "6|4", "4|3", "6|5", "1|6", "6|2", "1|4", "5|4", "3|6", "6|3", "5|6", "1|5", "3|1", "1|2", "1|3", "5|4", "2|4", "1|5", "5|4", "1|4", "6|2", "6|3", "6|4", "5|1", "6|1", "1|6", "1|3", "2|5", "6|5", "5|6", "1|5", "5|3", "6|2", "2|6", "5|2", "6|3", "1|4", "6|1", "1|5", "2|1", "5|3", "6|5", "1|2"])
    TrialsRatio.trialsRatio15.push(["1|5", "5|6", "5|4", "6|2", "1|6", "3|5", "5|3", "6|5", "6|4", "5|4", "1|5", "5|1", "4|2", "6|4", "1|3", "1|5", "6|3", "5|1", "6|4", "3|6", "1|4", "2|3", "5|3", "1|2", "4|3", "5|1", "5|1", "6|3", "5|2", "1|2", "1|5", "5|2", "5|6", "1|2", "2|4", "5|3", "4|1", "5|6", "1|4", "1|4", "5|2", "6|5", "6|4", "6|1", "1|6", "2|5", "6|1", "1|2", "5|4", "5|1", "1|2", "6|5", "2|1", "5|3", "5|6", "6|4", "1|6", "6|2", "1|5", "1|3", "5|4", "5|2", "1|6", "1|4", "5|6", "6|1", "1|6", "1|4", "1|3", "6|2", "3|2", "2|6", "6|3", "3|4", "4|5", "1|3", "4|6", "5|2", "3|1", "6|1", "6|2", "6|5", "1|3", "5|3", "6|1", "6|2", "6|5", "6|3", "5|4", "6|3"])
    TrialsRatio.trialsRatio15.push(["1|2", "6|2", "1|5", "1|6", "3|5", "1|4", "1|6", "5|1", "6|1", "1|2", "5|4", "5|1", "5|4", "2|5", "3|2", "6|1", "6|2", "5|2", "2|6", "5|6", "1|4", "6|4", "6|5", "1|2", "5|4", "5|4", "1|5", "2|4", "6|4", "5|3", "6|5", "5|2", "1|3", "4|6", "5|3", "5|2", "2|3", "5|6", "6|5", "6|4", "5|1", "3|4", "1|5", "1|3", "1|4", "3|1", "1|6", "5|3", "6|3", "4|5", "5|6", "6|4", "6|1", "6|1", "1|4", "1|5", "6|2", "1|2", "5|4", "6|3", "6|3", "3|6", "1|6", "6|3", "4|2", "5|2", "1|6", "6|3", "1|3", "1|4", "6|1", "4|1", "6|4", "5|1", "6|2", "5|2", "5|6", "4|3", "1|3", "6|2", "1|5", "2|1", "5|6", "6|5", "1|3", "5|3", "6|5", "5|3", "5|1", "1|2"])
    TrialsRatio.trialsRatio15.push(["6|1", "1|3", "6|3", "1|5", "6|5", "5|3", "1|6", "6|1", "5|3", "1|6", "2|5", "5|6", "1|5", "5|6", "5|4", "6|4", "6|2", "6|1", "6|2", "1|3", "1|4", "1|4", "4|3", "5|2", "3|5", "3|1", "1|4", "5|6", "1|3", "4|6", "6|2", "6|4", "1|6", "5|1", "1|4", "5|3", "4|5", "5|4", "6|2", "2|4", "5|4", "1|6", "6|4", "5|2", "3|6", "6|4", "6|5", "1|5", "4|2", "2|1", "5|4", "5|2", "6|4", "5|1", "5|3", "6|5", "6|1", "5|6", "1|3", "3|4", "3|2", "6|3", "1|2", "5|6", "5|4", "1|5", "5|1", "6|3", "1|4", "6|1", "6|5", "1|2", "6|5", "5|1", "1|2", "6|3", "6|3", "5|2", "2|3", "4|1", "2|6", "5|3", "6|2", "1|2", "5|1", "1|3", "1|2", "1|5", "1|6", "5|2"])
    TrialsRatio.trialsRatio15.push(["6|5", "5|6", "6|4", "5|4", "6|2", "5|2", "4|1", "1|4", "6|1", "6|3", "1|2", "5|3", "1|2", "5|4", "3|4", "1|4", "5|6", "4|6", "1|5", "6|4", "6|4", "3|2", "1|3", "6|1", "1|3", "6|1", "1|5", "1|4", "1|3", "5|3", "1|4", "5|6", "1|6", "2|3", "5|1", "6|2", "2|1", "4|3", "6|3", "1|6", "5|1", "3|6", "1|5", "6|2", "3|1", "5|1", "6|5", "1|6", "5|2", "6|3", "1|5", "5|1", "1|3", "1|2", "1|2", "1|2", "6|2", "6|1", "5|2", "2|5", "5|3", "4|2", "5|6", "5|2", "5|6", "5|1", "5|4", "2|6", "6|1", "1|3", "3|5", "1|4", "5|4", "1|6", "6|5", "6|3", "5|4", "6|5", "4|5", "6|3", "2|4", "6|4", "6|5", "6|4", "1|5", "5|3", "6|2", "1|6", "5|3", "5|2"])
    TrialsRatio.trialsRatio15.push(["4|1", "1|6", "5|2", "6|1", "5|4", "6|3", "6|1", "3|1", "5|3", "1|5", "1|4", "2|3", "1|4", "5|1", "1|6", "5|4", "4|6", "2|1", "1|5", "6|4", "3|2", "5|2", "5|6", "2|4", "6|4", "1|6", "1|5", "5|1", "6|2", "1|3", "6|5", "1|3", "1|4", "1|3", "1|3", "5|2", "5|4", "1|5", "6|1", "5|2", "6|2", "1|2", "6|3", "5|1", "5|1", "5|3", "5|1", "6|3", "1|2", "6|3", "2|5", "3|4", "1|6", "6|5", "5|6", "1|2", "1|3", "2|6", "4|2", "6|2", "4|5", "1|4", "1|6", "6|3", "6|4", "5|2", "6|4", "6|5", "4|3", "1|2", "1|5", "3|6", "3|5", "5|3", "5|6", "1|4", "6|1", "6|4", "6|1", "6|5", "5|4", "5|6", "6|2", "5|6", "5|3", "6|2", "5|4", "6|5", "1|2", "5|3"])
    TrialsRatio.trialsRatio15.push(["4|2", "1|6", "1|5", "2|5", "1|5", "5|6", "5|3", "6|3", "3|5", "1|2", "5|2", "5|2", "6|5", "5|2", "1|2", "4|5", "1|2", "6|4", "6|5", "5|6", "5|1", "5|2", "6|2", "1|3", "2|1", "5|4", "1|6", "6|4", "3|1", "1|5", "5|6", "6|4", "1|3", "3|2", "5|4", "5|3", "1|5", "3|6", "2|3", "1|3", "6|1", "4|3", "6|2", "1|4", "5|1", "6|3", "5|2", "6|5", "1|2", "5|4", "1|4", "5|6", "5|6", "2|4", "6|5", "6|4", "6|2", "1|2", "6|3", "4|6", "5|3", "1|6", "5|3", "5|1", "6|2", "2|6", "1|4", "6|1", "1|6", "6|1", "5|1", "6|5", "5|4", "1|3", "6|3", "5|4", "1|5", "3|4", "5|3", "4|1", "1|4", "1|6", "6|1", "1|4", "1|3", "6|3", "5|1", "6|4", "6|2", "6|1"])
  },

  testPath: function (path, entitiesByCategory) {
    trials = path.length;

    if (trials != 30) {
      console.log("ERROR PATH No tiene 30")
    } else {
      console.log("50 trials")
    }
    for (entry = 0; entry < trials; entry++) {
      categories_from_to = path[entry].split("|")
      console.log("TRIAL: %d result: %s", (entry + 1), categories_from_to)
      if (categories_from_to[0] === "0") {
        console.log("trial sin cambio");
      } else {
        if (entitiesByCategory[categories_from_to[0]]) {
          //console.log(" Ir de categoria: %s cantidad actual %d a categoria %s cantidad futura %d:", categories_from_to[0], entitiesByCategory[categories_from_to[0]], categories_from_to[1], entitiesByCategory[categories_from_to[1]] + 1)
          entitiesByCategory[categories_from_to[0]] = entitiesByCategory[categories_from_to[0]] - 1
          entitiesByCategory[categories_from_to[1]] = entitiesByCategory[categories_from_to[1]] + 1
        } else {
          console.log("%c ERRRROROROORRO", )
          console.log(" %c WRONG ", 'background: #ff0000')

          return false;
        }
      }
      console.log(entitiesByCategory)
    }
    console.log(" Estado FINAL")
    console.log(" %c POSSIBLE ", 'background: #00ff00')
    console.log(entitiesByCategory)
  }

}
