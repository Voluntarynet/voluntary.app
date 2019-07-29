"use strict"

/*
    KeyboardListener

    Listens to a set of keyboard events.

*/

EventSetListener.newSubclassNamed("KeyboardListener").newSlots({
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        //this.setIsDebugging(true)
        return this
    },

    setupEventsDict: function() {
        this.addEventNameAndMethodName("keyup", "onKeyUp");
        this.addEventNameAndMethodName("keydown", "onKeyDown");
        //this.addEventNameAndMethodName("keypress", "onKeyPress");
        //this.addEventNameAndMethodName("change", "onChange");
        //this.addEventNameAndMethodName("select", "onSelect");
        return this
    },
})
