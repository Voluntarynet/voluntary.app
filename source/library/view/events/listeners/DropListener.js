"use strict"

/*
    DropListener

    Listens to a set of events on a drop target.

*/

window.DropListener = class DropListener extends EventSetListener {
    
    initPrototype () {

    }

    init () {
        super.init()
        return this
    }

    setupEventsDict () {
        // fired on drop target
        this.addEventNameAndMethodName("dragover",  "onDragOver"); // must prevent default
        this.addEventNameAndMethodName("dragenter", "onDragEnter"); // must prevent default
        this.addEventNameAndMethodName("drop",      "onDrop");
        this.addEventNameAndMethodName("dragleave", "onDragLeave");
        return this
    }

    start () {
        super.start()
        this.listenTarget().__isListeningForDrop___ = true
        return this
    }

    stop () {
        super.stop()
        this.listenTarget().__isListeningForDrop___ = false // breaks if multiple drop listeners on same element
        return this
    }

    onBeforeEvent (methodName, event) {
        this.debugLog(" onBeforeEvent " + methodName)
        return this
    }
    
}.initThisClass()
