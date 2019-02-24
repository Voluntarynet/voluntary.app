"use strict"

/*
    Mouse

    Global shared instance that tracks current mouse state in window coordinates.
    Registers for capture mouse events on document.body.
*/


window.Mouse = ideal.Proto.extend().newSlots({
    type: "Mouse",
    isDown: false,
    downEvent: null,
    currentEvent: null,
    upEvent: null,
    mouseListener: null,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        this.startListening()
        return this
    },

    shared: function() { 
        return this.sharedInstanceForClass(Mouse)
    },

    startListening: function() {
        this.setMouseListener(MouseListener.clone().setUseCapture(true).setElement(document.body).setDelegate(this))
        this.mouseListener().setIsListening(true)
        return this
    },

    // positions

    downPos: function() {
        return this.pointForEvent(this.downEvent())
    },

    currentPos: function() {
        return this.pointForEvent(this.currentEvent())
    },

    upPos: function() {
        return this.pointForEvent(this.upEvent())
    },

    // events

    onMouseDownCapture: function(event) {
        this.setDownEvent(event)
        this.setCurrentEvent(event)
        this.setIsDown(true);
        return true
    },

    onMouseMoveCapture: function (event) {
        this.setCurrentEvent(event)
        return true
    },

    onMouseUpCapture: function(event) {
        this.setCurrentEvent(event)
        this.setUpEvent(event)
        this.setIsDown(false);
        return true
    },  

    // -- helpers ---

    pointForEvent: function(p, event) {
        if (event) {
            return Point.clone().set(event.clientX, event.clientY).setTimeToNow()
        }
        return Point.clone()
    },

    dragVector: function(event) {
        if (this.isDown()) {
            return this.currentPos().subtract(this.downPos())
        }
        return Point.clone()
    },
})
