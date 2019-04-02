"use strict"

/*
    GamePadListener

    Listens to a set of mouse events.

*/

window.GamePadListener = EventSetListener.extend().newSlots({
    type: "GamePadListener",
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

