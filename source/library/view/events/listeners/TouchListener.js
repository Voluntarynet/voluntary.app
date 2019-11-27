"use strict"

/*
    TouchListener

    Listens to a set of touch events.

*/

window.TouchListener = class TouchListener extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        return this
    }

    setupEventsDict () {
        this.addEventNameAndMethodName("touchstart",  "onTouchStart");
        this.addEventNameAndMethodName("touchmove",   "onTouchMove");
        this.addEventNameAndMethodName("touchcancel", "onTouchCancel");
        this.addEventNameAndMethodName("touchend",    "onTouchEnd");
        return this
    }

}.initThisClass()
