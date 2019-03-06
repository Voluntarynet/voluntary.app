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

    numberOfTouchesRequired: 1,
    minDistToBegin: 10,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        //this.setIsDebugging(true)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        return this
    },

})
