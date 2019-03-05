"use strict"

/*

    RotationGestureRecognizer


*/


window.RotationGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "RotationGestureRecognizer",
    isPressing: false,

    minFingersRequired: 1,
    minDistToBegin: 10,

}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        //this.setIsDebugging(true)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        return this
    },

})
