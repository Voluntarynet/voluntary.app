"use strict"

/*
    GestureManager

    We typically only want one gesture to be active globally.
    GestureManager helps to coordinate which gesture has control.

*/


window.GestureManager = ideal.Proto.extend().newSlots({
    type: "GestureManager",
    activeGesture: null,
}).setSlots({

    init: function () {
        return this
    },

    shared: function() {   
        return this.sharedInstanceForClass(GestureManager)
    },

    requestActiveGesture: function(aGesture) {
        assert(aGesture)

        this.releaseActiveGestureIfDormant()
        assert(aGesture !== this.activeGesture())

        if (!this.activeGesture()) {
            this.setActiveGesture(aGesture)
            return true
        }

        return false
    },

    releaseActiveGestureIfDormant: function() {
        if (this.activeGesture() && !this.activeGesture().isActive()) {
            this.setActiveGesture(null)
        }
        return this
    },

    /*
    releaseActiveGesture: function(aGesture) {

    },
    */

})
