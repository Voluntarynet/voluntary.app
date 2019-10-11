"use strict"

/*
    GamePadListener

    Listens to a set of mouse events.

*/

EventSetListener.newSubclassNamed("GamePadListener").newSlots({
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        return this
    },

    setupEventsDict: function() {
        this.addEventNameAndMethodName("gamepadconnected",   "onGamePadConnected");
        this.addEventNameAndMethodName("gamepaddisconnected", "onGamePadDisconnected");
        return this
    },

})

