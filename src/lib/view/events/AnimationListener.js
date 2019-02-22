"use strict"

/*
    AnimationListener

    Listens to a set of animation events.

*/

window.AnimationListener = EventSetListener.extend().newSlots({
    type: "AnimationListener",
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)

        this.addEventNameAndMethodName("animationend", "onAnimationEnd");
        this.addEventNameAndMethodName("animationiteration", "onAnimationIteration");
        this.addEventNameAndMethodName("animationstart", "onAnimationStart");

        return this
    },

})
