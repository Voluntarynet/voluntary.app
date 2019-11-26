"use strict"

/*
    DropListener

    Listens to a set of events on a drop target.

*/

EventSetListener.newSubclassNamed("DropListener").newSlots({
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        //this.setIsDebugging(true)
        return this
    },

    setupEventsDict: function() {
        // fired on drop target
        this.addEventNameAndMethodName("dragover",  "onDragOver"); // must prevent default
        this.addEventNameAndMethodName("dragenter", "onDragEnter"); // must prevent default
        this.addEventNameAndMethodName("drop",      "onDrop");
        this.addEventNameAndMethodName("dragleave", "onDragLeave");
        return this
    },

    start: function() {
        EventSetListener.start.apply(this)
        this.listenTarget().__isListeningForDrop___ = true
        return this
    },

    stop: function() {
        EventSetListener.stop.apply(this)
        this.listenTarget().__isListeningForDrop___ = false // breaks if multiple drop listeners on same element
        return this
    },

    onBeforeEvent: function(methodName, event) {
        this.debugLog(" onBeforeEvent " + methodName)
        return this
    },
    
}).initThisProto()
