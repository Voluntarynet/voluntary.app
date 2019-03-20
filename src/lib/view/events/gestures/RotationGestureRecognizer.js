"use strict"

/*

    RotationGestureRecognizer

    Overrides OrientGestureRecognizer's hasMovedEnough() method to 
    check for minRotationInDegreesToBegin.
    
    Delegate messages:

        onRotationBegin
        onRotationMove
        onRotationComplete
        onRotationCancelled

    Helper methods:
    
        rotation:
            activeAngleInDegress // current angle between 1st two fingers down
            rotationInDegrees // difference between initial angle between 1st two fingers down and their current angle

*/


window.RotationGestureRecognizer = OrientGestureRecognizer.extend().newSlots({
    type: "RotationGestureRecognizer",
    minRotatationInDegreesToBegin: 1,
}).setSlots({
    init: function () {
        OrientGestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        this.setIsDebugging(true)
        return this
    },

    hasMovedEnough: function() {
        let ma = this.minRotatationInDegreesToBegin()
        let a = this.activeAngleInDegress()
        return a >= ma
    },
})