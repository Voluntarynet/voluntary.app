"use strict"

/*
    DropListener

    Listens to a set of events on a drop target.

*/

window.DropListener = EventSetListener.extend().newSlots({
    type: "DropListener",
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        return this
    },

    setupEventsDict: function() {
        // fired on drop target
        this.addEventNameAndMethodName("dragover",  "onDragOver"); // must prevent default
        this.addEventNameAndMethodName("dragenter", "onDragEnter"); // must prevent default
        this.addEventNameAndMethodName("drop",       "onDrop");
        this.addEventNameAndMethodName("dragleave", "onDragLeave");
        return this
    },

    start: function() {
        EventSetListener.start.apply(this)
        this.element().__isListeningForDrop___ = true
        return this
    },

    stop: function() {
        EventSetListener.stop.apply(this)
        this.element().__isListeningForDrop___ = false // breaks if multiple drop listeners on same element
        return this
    },
})
