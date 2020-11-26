/******* Define Entities *******/
var Entity = {}

Entity = Unit.extends({
  constructorPlus: function (props) {
    this.sound = {
      normal: new Audio(Game.CDN + 'bgm/sonido3.wav')
    }
    this.sound.selected = this.sound.normal
    //console.log("Constructor")
  },
  prototypePlus: {
    //Add basic unit info
    name: 'entity',
    category:  Category.FRIEND,
    colour: Colour.GRAY,
    width: 30,
    height: 30,
    speed: 1,
    visible: true
    /*
    moveToLocation:function(  location ){

    if ( location ){
    var myself=this;
    //   console.log("command center  Location " + location.x + " " + location.y + " trabajador  " + id );
    this.moveTo(   location.x,  location.y, 100,
    //callback
    function(){
    console.log("Arriving to position")
  });
}
}
*/
  }
})
