var mouseController = {
    //down: false,
    //drag: false,
    clickmap: new Audio(Game.CDN + 'bgm/sonido4.wav')
    ,
    startPoint: {x: 0, y: 0},
    endPoint: {x: 0, y: 0},

    leftClick: function (event) {


        if( Game.smithsTurn) {
            console.log( "SMITHS TURN" + Game.smithsTurn + " Trial click"+ Game.trialByClick ) ;
            return;}
        if ( Game.trialByClick ) {
            console.log( "Mouse blocked  " +Game.trialByClick +  " SMITH TURN" + Game.smithsTurn ) ;
        return;}
        //Mouse at (clickX,clickY)
        var offset = $('#fogCanvas').offset();
        var clickX = event.pageX - offset.left;
        var clickY = event.pageY - offset.top;
        //Intercept event inside infoBox
       /* if (clickY < 50 ){ console.log("interceptado Y menor a 50");
            return;}*/

        var selectedOne = Game.getSelectedOne(clickX + Map.offsetX, clickY + Map.offsetY);
        //Cannot select enemy invisible unit

            Game.unselectAll();
        //If has selected one

        if (selectedOne instanceof Gobj) {

           // console.log(" Mouse cortoller SELECT END TRIAL " );
            if ( Game.trainingStarted){
                Game.trialEndTime = Game.getCurrentTs()
                Game.endingTick = Game.mainTick,
              //  console.log("Entity selected %f" , );
                 Game.changeSelectedTo(selectedOne);
            selectedOne.sound.selected.play();

            //    Game.showSmith( true );
                Game.updateTrialClick( selectedOne );

            }
        }

        $('div.tooltip_Box').hide();
        //Login user statistic
        if (Participation.statistic != null) Participation.statistic.left++;
    },
    rightClick: function (event, unlock, btn) {
/*
        //Mouse at (clickX,clickY)
        var offset = $('#fogCanvas').offset();
        var clickX = event.pageX - offset.left;
        var clickY = event.pageY - offset.top;
        //Intercept event inside infoBox
        if (clickY <  50 ) {
            console.log("return");
            return;
        }
        //Show right click cursor
        var pos = {x: (clickX + Map.offsetX), y: (clickY + Map.offsetY)};




        //this.clickmap.play(); STOP Sound

        var charas = Game.allSelected.filter(function (chara) {

            //return chara.team == Game.team && chara.status != "dead"; In the future
            return true;
        });
        //Handle user right click


        Participation.cmds.push(JSON.stringify({

            type: 'rightClick',
            uids: Participation.getUIDs(charas),

            pos: pos,
            unlock: Boolean(unlock),
            btn: btn
        }));
        //console.log("rightClick4");
        //Login user statistic
        if (Participation.statistic != null) Participation.statistic.right++;
    },
    rightClickHandler: function (charas, pos, unlock, btn) {
        //Find selected one or nothing
//        console.log("rightClickHandler");
        var selectedEnemy = (charas.length > 0) ? Game.getSelectedOne(pos.x, pos.y, charas[0].team.toString()) : null;


  //      console.log("rightClickHandler cs");
        var selectedOne = Game.getSelectedOne(pos.x, pos.y);///extra
        if (selectedOne instanceof Gobj) {
            //Sound effect
            console.log("gobj");


        }

        charas.forEach(function (chara) {
        //    console.log("for each chara" + chara);
            //Sound effect
            if (chara.sound.moving) {
                chara.sound.moving.play();

            }//Interrupt old destination routing

            if (chara.destination) {
                //console.log("  charea desteination " + chara.destination );
                //Break possible dead lock
                if (chara.destination.next) chara.destination.next = null;
                delete chara.destination;
            }

                chara.moveToLocation(pos)

        });*/
    },



    toControlAll: function () {
        //For desktop
        if (!Game.isApp) {
            //Mouse left click
            $('#fogCanvas')[0].onclick = function (event) {
                event.preventDefault();
                if (mouseController.drag) {
                    //End drag, onclick triggered after onmouseup, don't do default left click action
                    mouseController.drag = false;
                } else {
                    mouseController.leftClick(event);
                }
            };
            //Mouse right click
            $('#fogCanvas')[0].oncontextmenu = function (event) {
                //Prevent context menu show
                event.preventDefault();
                //Should not control units during replay
                if (Game.replayFlag) return;
                mouseController.rightClick(event);
                //Cancel pointer
                $('div.GameLayer').removeAttr('status');
                //Cancel callback

            };
            //Double click
            $('#fogCanvas')[0].ondblclick = function (event) {
                //Prevent screen select
                event.preventDefault();
           //     mouseController.dblClick();
            };
            //Mouse click start
            $('#fogCanvas')[0].onmousedown = function (event) {
                event.preventDefault();
                //Do not allow rectangular-multi-select with right click, only left clicks
               /* Draggdeactovated
                if (event.which === 3) {
                    return;
                }
                if (!mouseController.down) {
                    //Mouse at (clickX,clickY)
                    var clickX = event.pageX - $('#fogCanvas').offset().left;
                    var clickY = event.pageY - $('#fogCanvas').offset().top;
                    mouseController.startPoint = {x: clickX, y: clickY};
                    mouseController.down = true;
                }*/
            };
            //Mouse drag
            $('#fogCanvas')[0].onmousemove = function (event) {
                event.preventDefault();
             /* DRagg deactivated   if (mouseController.down) {
                    //Mouse at (clickX,clickY)
                    var clickX = event.pageX - $('#fogCanvas').offset().left;
                    var clickY = event.pageY - $('#fogCanvas').offset().top;
                    mouseController.endPoint = {x: clickX, y: clickY};
                    if (Math.abs(clickX - mouseController.startPoint.x) > 5 &&
                        Math.abs(clickY - mouseController.startPoint.y) > 5) {
                        mouseController.drag = true;
                    }
                }*/
            };
            //Global client refresh map
            window.onmousemove = function (event) {
                event.preventDefault();
                /*console.log("MOVE MOUSE BUG RARO")
                //Mouse at (clickX,clickY)
                mouseController.mouseX = event.clientX;
                mouseController.mouseY = event.clientY;*/
            };
            //Mouse click end
            $('#fogCanvas')[0].onmouseup = function (event) {
                event.preventDefault();
                mouseController.down = false;
                if (mouseController.drag) {
                    //Multi select inside rect
                    Game.multiSelectInRect();
                }
            };
        }
        //Both sides
        $('div#GamePlay div').on('contextmenu', function (event) {
            event.preventDefault();
        });
        $('canvas[name="mini_map"]').on('click', function (event) {
            event.preventDefault();
            Map.clickHandler(event);
        });
        $('canvas[name="mini_map"]').on('contextmenu', function (event) {
            event.preventDefault();
            Map.dblClickHandler(event);
        });
    }
};
