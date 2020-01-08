"use strict"

/*
    ClipboardListener

    Listens to a set of clip board events.

*/

window.ClipboardListener = class ClipboardListener extends EventSetListener {
    
    initPrototype () {

    }

    init () {
        super.init()
        return this
    }

    setupEventsDict () {
        this.addEventNameAndMethodName("copy", "onCopy");
        this.addEventNameAndMethodName("cut", "onCut");
        this.addEventNameAndMethodName("paste", "onPaste");
        return this
    }

}.initThisClass()
