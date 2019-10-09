"use strict"

/*
    WheelListener

    Listens to a set of wheel (mouse or other wheel) events.

*/

EventSetListener.newSubclassNamed("WheelListener").newSlots({
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        return this
    },

    setupEventsDict: function() {
        this.addEventNameAndMethodName("wheel",   "onWheel");
        return this
    },

})
