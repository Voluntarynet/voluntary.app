"use strict"

/*
    ClipboardListener

    Listens to a set of clip board events.

*/

EventSetListener.newSubclassNamed("ClipboardListener").newSlots({
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        return this
    },

    setupEventsDict: function() {
        this.addEventNameAndMethodName("copy", "onCopy");
        this.addEventNameAndMethodName("cut", "onCut");
        this.addEventNameAndMethodName("paste", "onPaste");
        return this
    },

})
