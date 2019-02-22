"use strict"

/*
    Mouse

    Global shared instance that tracks current mouse state in window coordinates.
    View has convenience methods to get this state into view coords.

    to decide: Should the document register for mouse events and set Mouse, 
    or should the Mouse do this? What about gestures?
*/


window.Mouse = ideal.Proto.extend().newSlots({
    type: "Mouse",
    isDown: false,
    downEvent: null,
    currentEvent: null,
    upEvent: null,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        return this
    },

    shared: function() { 
        return this.sharedInstanceForClass(Mouse)
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

    onMouseDown: function(event) {
        this.setDownEvent(event)
        this.setCurrentEvent(event)
        this.setIsDown(true);
        return true
    },

    onMouseMove: function (event) {
        this.setCurrentEvent(event)
        return true
    },

    onMouseUp: function(event) {
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
