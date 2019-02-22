"use strict"

/*
    KeyboardListener

    Listens to a set of keyboard events.

*/
window.KeyboardListener = EventSetListener.extend().newSlots({
    type: "KeyboardListener",
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)

        this.addEventNameAndMethodName("keyup", "onKeyUp");
        this.addEventNameAndMethodName("keydown", "onKeyDown");
        //this.addEventNameAndMethodName("keypress", "onKeyPress");
        //this.addEventNameAndMethodName("change", "onChange");
        
        return this
    },

})
