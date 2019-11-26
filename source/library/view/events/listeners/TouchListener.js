"use strict"

/*
    TouchListener

    Listens to a set of touch events.

*/

EventSetListener.newSubclassNamed("TouchListener").newSlots({
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

}).initThisProto()
