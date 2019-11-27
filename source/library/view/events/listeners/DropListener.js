"use strict"

/*
    DropListener

    Listens to a set of events on a drop target.

*/

window.DropListener = class DropListener extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
        })
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
        EventSetListener.start.apply(this)
        this.listenTarget().__isListeningForDrop___ = true
        return this
    }

    stop () {
        EventSetListener.stop.apply(this)
        this.listenTarget().__isListeningForDrop___ = false // breaks if multiple drop listeners on same element
        return this
    }

    onBeforeEvent (methodName, event) {
        this.debugLog(" onBeforeEvent " + methodName)
        return this
    }
    
}.initThisClass()
