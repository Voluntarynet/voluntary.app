"use strict"

/*

    *** currently unused ***
    
    GestureSet

    Manages an ordered set of gesture recognizers for a given view.
    When a gesture  becomes active, it tells it's gesture set, 
    which suppresses other gestures until the active gesture is 
    complete or cancels. 

*/


window.GestureSet = ideal.Proto.extend().newSlots({
    type: "GestureSet",
    viewTarget: null,
    gestures: null,
    activeGesture: null,
}).setSlots({
    init: function () {
        this.setGestures([]) 
        return this
    },

    

})
