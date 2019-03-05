"use strict"

/*

    PinchGestureRecognizer

    Delegate messages:

        onPinchBegin
        onPinchMove
        onPinchComplete
        onPinchCancelled
*/


window.PinchGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "PinchGestureRecognizer",
    isPressing: false,

    // new stuff
    numberOfTouchesRequired: 1,
    minDistToBegin: 10,

    downPositionInTarget: null,
    downPosition: null,
    currentPosition: null,
    upPosition: null,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        //this.setIsDebugging(true)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        return this
    },



})
