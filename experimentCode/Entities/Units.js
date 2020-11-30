//Define unit which has HP/direction and be selectable, unattackable unit
var Unit = Gobj.extends({
    constructorPlus: function (props) {
        //Add id for unit
        this.id = Unit.currentID++;
        this.selected = false;
        //Each unit instance has its own sound
        this.sound = {
            selected: new Audio(Game.CDN + 'bgm/sonido1.wav'),
            moving: new Audio(Game.CDN + 'bgm/sonido1.wav'),
        };
        //Execute below after inherited class fully constructed, postpone
        var myself = this;

        /*
        Game.commandTimeout(function () {
            //Add this unit into Game
            console.log( " TIME OUT AHORA")
            Unit.allUnits.push(myself);
            myself.dock();
        }, 0);*/
    },
    prototypePlus: {
        name: "Unit",
        //Override Gobj method
        animeFrame: function () {
            this.action++;

        },
        detectOutOfBound: function () {
            //PACMAN
            /*var boundX = Map.getCurrentMap().width - this.width;
            var boundY = Map.getCurrentMap().height - this.height;
*/
           // var boundX = Map.getCurrentMap().width + this.width;
            var boundX = Map.getCurrentMap().width ;
            //var boundY = Map.getCurrentMap().height + this.height;
            var boundY = Map.getCurrentMap().height ;

//            console.log("detect out of bound %f %f    %f " , boundX , boundY , this.direction );
            //Right Bound
            if (this.x > boundX-20) {
                //this.x = boundX;
  //              console.log("wrap extrema derecha");
                this.x = -5;
            }
            //Left Bound
            if (this.x < -5) {
    //            console.log("wrap extrema izquierda");
                //this.x = 0;
                this.x = boundX - 20;
            }
            //Bottom Bound
            if (this.y > boundY-20) {
        //        console.log("wrap por abajo");
                //this.y = boundY;
                this.y = -5;
            }
            //Top Bound
            if (this.y < -5) {
                //this.y = 0;
      //          console.log("wrap por arriba");
                this.y = boundY - 20;//hardcode
            }
        },
        //Can move in any direction
        updateLocation: function () {

            this.x = Math.round(this.x + this.speed[0] * Math.cos(this.angle));
            this.y = Math.round(this.y + this.speed[1] * Math.sin(this.angle));


        },
        //Add new functions to prototype
        turnTo: function (direction) {
            //Change direction
            this.direction = direction;
        },
        //Dock means stop moving but keep animation
        dock: function () {
            //Clear old timer
            this.stop();
            //Launch new dock timer
            this.status = "dock";
            this.action = 0;
            var myself = this;

        },

        stopMoving: function () {
            this.dock();
        },//alias
        run: function () {
//            console.log( " RUN towards point")
            this.moving();
        },

        navigateTo: function (clickX, clickY, range) {
            if (!range) range = Unit.moveRange;//Smallest limit by default
            //Center position
            //	console.log(" x, y : " + this.x + " " + this.y  );
            var charaX = this.posX();
            var charaY = this.posY();

            //console.log("DESPUES x, y : " + charaX + " " + charaY);
            //Already at check point
            if (this.insideCircle({centerX: clickX, centerY: clickY, radius: range})) {
//                console.log("en circulo")
                this.dock();
                //Stop routing
                delete this.allFrames['routing'];
                //Reach destination flag

                return true;
            }
            //Need move
            else {
                var vector = [clickX - this.posX(), clickY - this.posY()];
                vector = vector.map(function (n) {
                    return n / _$.hypot(vector);
                });
                //Only unit on ground will collide with others
              //  FORCE = 0.4;
                FORCE = .6;

                myself = this;
                //    console.log("Move 1")
                //Soft collision

                var softCollisions = Unit.allUnits.filter(function (chara) {
                    if (chara == myself) {
                        return false;
                    } else {
                        return chara.softCollideWith(myself);
                    }
                });
                softCollisions.forEach(function (chara) {
                    var softResist = [myself.posX() - chara.posX(), myself.posY() - chara.posY()];
                    softResist = softResist.map(function (n) {

                        return n * FORCE / _$.hypot(softResist);
                    });
                    vector[0] += softResist[0];
                    vector[1] += softResist[1];

                });
                //Hard collision
                softCollisions.filter(function (chara) {
                    return chara.collideWith(myself);
                }).forEach(function (chara) {
                    var hardResist = [myself.posX() - chara.posX(), myself.posY() - chara.posY()];
                    hardResist = hardResist.map(function (n) {
//                        console.log("hard resost resist")
                        return n * FORCE / _$.hypot(hardResist);
                    });
                    vector[0] += hardResist[0];
                    vector[1] += hardResist[1];
                });

                this.turnTo(Unit.wrapDirection(vector));
                vector.reverse();//y,x
                this.angle = Math.atan2(vector[0], vector[1]);
            }
        },


        moveTo: function (clickX, clickY, range, callback) {
            if (!range) {
                range = Unit.moveRange;//Smallest limit by default

                //		console.log(" asignando rango");

            }
            //Start new routing
            //	console.log(" rango " + range )
            var myself = this;
            var routingFrame = function () {
                if (myself.navigateTo(clickX, clickY, range)) {
                    //Run callback when reach target
                    if (typeof (callback) == 'function') callback();
                    return true;
                }
            };

            this.allFrames['routing'] = routingFrame;
            //Start moving
            console.log("start moving")

            this.run();
        },
        moveToward: function (target, range, callback) {
            if (!range) range = Unit.moveRange;//Smallest limit by default
            //Start new routing
            var myself = this;
            var routingFrame = function () {
                if (target.status != 'dead') {
                    if (myself.navigateTo(target.posX(), target.posY(), range)) {

                        //Run callback when reach target
                        if (typeof (callback) == 'function') callback();
                        //Reach destination flag, fix twice callback issue
                        return true;
                    }
                }
                //Will stop move toward dead target
                else {
                    delete myself.allFrames['routing'];
                    myself.dock();
                }
            };
            this.allFrames['routing'] = routingFrame;
            //Start moving
            this.run();
        },

        moveTowardPoint: function (pos, range, callback) {
            if (!range) range = Unit.moveRange;//Smallest limit by default
            //Start new routing
            var myself = this;
//            console.log( " Move towards point " + pos.x + " " + pos.y)
            var routingFrame = function () {
                if (myself.navigateTo(pos.x, pos.y, range)) {
                //    console.log( " YA LLEGUE")
                    //Run callback when reach target
                    if (typeof (callback) == 'function') callback();
                    //Reach destination flag, fix twice callback issue
                    return true;
                }
            };
            this.allFrames['routing'] = routingFrame;
            //Start moving
            this.run();
        },

        AI: function () {
            this.walkRandomPosition()
        }
        ,

        walkRandomPosition: function () {
            //Add in new things
            var myself = this;
            //if ((Game.mainTick + myself.id) % 50 == 0) {//sospechoso
            //console.log( " tick, %d id %d cat %d", Game.mainTick , myself.id , myself.category)
            if ((Game.mainTick + (myself.id*5) ) % 200 == 0) {//sospechoso

                //check this
                //if( myself.id )
                var pos = {
                    x: Game.randomIntFromInterval(-50, 850),
                    y: Game.randomIntFromInterval(-50, 850),
                };
                xizq = Math.random()
                yizq = Math.random()
              //  console.log( " x  %f y %f  " , xizq, yizq )
                if ( xizq <.33 ){
          //          console.log( " izq")
                    if ( yizq <.33){

                        pos.x = Game.randomIntFromInterval(0, 200)
                        pos.y = Game.randomIntFromInterval(0, 200);
                    }else if ( yizq <.66){
      //                  console.log( " abajo")
      /*                  pos.x = -20;
                        pos.y = 820;*/
                        pos.x = Game.randomIntFromInterval(0, 200)
                        pos.y = Game.randomIntFromInterval(600, 800);
                    }else{
                    //  pos.x = Game.randomIntFromInterval(150, 650)
                        pos.y = Game.randomIntFromInterval(150, 650);
                    }
                }

                else if (xizq < .66){
    //                console.log( " der")
                    if ( yizq <.33){
//                        console.log( " arriba ")
                        /*pos.x = 820;
                        pos.y = -20;*/
                        pos.x = Game.randomIntFromInterval(600, 800)
                        pos.y = Game.randomIntFromInterval(0, 200);
                    }else if ( yizq <.66){
  //                      console.log( " abajo ")
/*
                        pos.x = 820;
                        pos.y = 820;
*/                       pos.x = Game.randomIntFromInterval(600, 800)
                        pos.y = Game.randomIntFromInterval(600, 800);

                    }
                    else{
                        pos.x = Game.randomIntFromInterval(-50, 850)
                        pos.y = Game.randomIntFromInterval(-50, 850);
                    }
                }

                //console.log(" x : %d y : %d ", pos.x , pos.y );
                //myself.moveTowardPoint(pos, 40);

                myself.moveTowardPoint(pos, 30 ,myself.walkRandomPosition);

            }
            ;

        },


        setRandomPosition: function () {
        //    this.walkRandomPosition();

            //Add in new things
            var myself = this;

//                console.log(" Set random position")

                //check this.
                var pos = {
                    x:-50,
                    y: -50,
                };
                xizq = Math.random()
                yizq = Math.random()
                //    console.log( " x  %f y %f  " , xizq, yizq )
                if ( xizq <.5 ){
                    //          console.log( " izq")
                    if ( yizq <.5){
                        //                console.log( " arriba")
                        pos.x = -50;
                        pos.y = -50;
                    }else{
                        //                  console.log( " abajo")
                        pos.x = -50;
                        pos.y = 850;
                    }
                }

                else {
                    //                console.log( " der")
                    if ( yizq <.5){
//                        console.log( " arriba ")
                        pos.x = 850;
                        pos.y = -50;
                    }else{
                        //                      console.log( " abajo ")
                        pos.x = 850;
                        pos.y = 850;
                    }
                }

            //                  console.log( " abajo")
                myself.moveTowardPoint(pos, 32);

        },



    }


    ,

});
//Assign current ID to each newly born unit
Unit.currentID = 0;

Unit.moveRange = 15;


//Range for mouse select
Unit.selectRange = 20;
//All existed units, class property
Unit.allUnits = [];

//Get all units count
Unit.count = function () {
    return Unit.allUnits.reduce(function (counts, chara) {
        counts[chara.team]++;
        return counts;
    }, Game.getPropArray(0));
};
//Random direction but can keep all clients same
Unit.randomDirection = function () {
    //Clossure variable and function
    var rands = [];
    var getRands = function () {
        //Use current tick X randomSeed as seed
        var seed = Game.mainTick + Game.randomSeed;
        var rands = [];
        for (var N = 0; N < 16; N++) {
            //Seed grows up
            seed = (seed * 5 + 3) % 16;//range=16
            rands.push(seed);
        }
        return rands;
    };
    return function () {
        //If all rands used, generate new ones
        if (rands.length == 0) rands = getRands();
        return rands.shift();
    }
}();

//Random direction but can keep all clients same
Unit.randomPos = function () {
    //Clossure variable and function
    return null;
}();
//Convert from vector to 16 directions
Unit.wrapDirection = function (vector) {
    //Atan2 can distinguish from -PI~PI, Y-axis is reverse
    var angle = Math.atan2(vector[1], vector[0]);
    var piece = Math.PI / 16;
    if (angle > (piece * 15)) return 12;
    if (angle > (piece * 13)) return 11;
    if (angle > (piece * 11)) return 10;
    if (angle > (piece * 9)) return 9;
    if (angle > (piece * 7)) return 8;
    if (angle > (piece * 5)) return 7;
    if (angle > (piece * 3)) return 6;
    if (angle > piece) return 5;
    if (angle > (-piece)) return 4;
    if (angle > (-piece * 3)) return 3;
    if (angle > (-piece * 5)) return 2;
    if (angle > (-piece * 7)) return 1;
    if (angle > (-piece * 9)) return 0;
    if (angle > (-piece * 11)) return 15;
    if (angle > (-piece * 13)) return 14;
    if (angle > (-piece * 15)) return 13;
    else return 12;
};
String.prototype.count=function(c) {
    var result = 0, i = 0;
    for(i;i<this.length;i++)if(this[i]==c)result++;
    return result;
};
