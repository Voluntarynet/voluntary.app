"use strict"

/*

    PinchGestureRecognizer

    Subclass of OrientGestureRecognizer that overrides hasMovedEnough() to 
    check for minDistToBegin.

    Delegate messages:

        onPinchBegin
        onPinchMove
        onPinchComplete
        onPinchCancelled

    Helper methods:

        scale:
            scale // current distance between 1st to fingers down divided by their intitial distance  

*/


window.PinchGestureRecognizer = OrientGestureRecognizer.extend().newSlots({
    type: "PinchGestureRecognizer",
}).setSlots({
    init: function () {
        OrientGestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        this.setIsDebugging(true)
        return this
    },

    hasMovedEnough: function() {
        let m = this.minDistToBegin()
        let d = this.currentPosition().distanceFrom(this.downPosition())
        return d >= m
    },
})
