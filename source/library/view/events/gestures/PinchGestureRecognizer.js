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


OrientGestureRecognizer.newSubclassNamed("PinchGestureRecognizer").newSlots({
}).setSlots({
    init: function () {
        OrientGestureRecognizer.init.apply(this)
        this.setListenerClasses(this.defaultListenerClasses()) 
        //this.setIsDebugging(false)
        //this.setIsVisualDebugging(true)
        this.setMinFingersRequired(2)
        this.setMaxFingersAllowed(2)
        return this
    },

    hasMovedEnough: function() {
        const m = this.minDistToBegin()
        const d = this.currentPosition().distanceFrom(this.downPosition())
        //console.log(this.shortTypeId() + ".hasMovedEnough() " + d + ">= min " + m)
        return d >= m
    },
    
}).initThisProto()
