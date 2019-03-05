"use strict"

/*
    TouchListener

    Listens to a set of touch events.

*/

window.TouchListener = EventSetListener.extend().newSlots({
    type: "TouchListener",
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        return this
    },

    setupEventsDict: function() {
        this.addEventNameAndMethodName("touchstart",  "onTouchStart");
        this.addEventNameAndMethodName("touchmove",   "onTouchMove");
        this.addEventNameAndMethodName("touchcancel", "onTouchCancel");
        this.addEventNameAndMethodName("touchend",    "onTouchEnd");
        return this
    },

})
