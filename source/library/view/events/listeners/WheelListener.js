"use strict"

/*
    WheelListener

    Listens to a set of wheel (mouse or other wheel) events.

*/

window.WheelListener = class WheelListener extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        return this
    }

    setupEventsDict () {
        this.addEventNameAndMethodName("wheel",   "onWheel");
        return this
    }

}.initThisClass()
